const AppError = require("../utils/AppError");
const User = require("../models/User");
const Token = require("../models/Token");
const jwt = require("jsonwebtoken");
const {
  verifyJwtToken,
  removeTokenFromResponseInDev,
} = require("../utils/token");
const { createVerifyTokenAndSendMail } = require("../utils/email");
const {generateHashedAndUnhashedCryptoToken} = require('../utils/token')

const { getBaseUrl } = require("../utils/utils");
const { catchAsyncError } = require("../utils/error");
const {
  convertUnhashedToHashedCryptoToken,
  getAuthTokenFromHeaderOrCookie,
  createJWTCookie,
} = require("../utils/token");
const { days, seconds } = require("../utils/time");
const Email = require("../services/Email");

exports.protect = catchAsyncError(async (req, res, next) => {
  const token = getAuthTokenFromHeaderOrCookie(req, "jwt");
  if (!token) {
    return next(
      new AppError("You are not logged in. Please log in to continue", 401)
    );
  }
  const decodedJwt = await verifyJwtToken(token);
  const user = await User.findById(decodedJwt.id).select("+role");
  if (!user) {
    return next(new AppError("User does not exist", 404));
  }
  const pwdChangedAfterJwtIssued = user.passwordChangedAfterIssued(
    decodedJwt.iat
  );
  if (pwdChangedAfterJwtIssued) {
    return next(
      new AppError(
        "You recently changed the password. Please log in again",
        401
      )
    );
  }
  req.user = user;
  res.locals.user = user;
  next();
});

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You are not authorized to perform this action", 401)
      );
    }
    next();
  };
};

exports.signup = catchAsyncError(async (req, res, next) => {
  const {
    email,
    password,
    confirmedPassword,
    student_type,
    name,
    SID,
  } = req.body;
  let exists = await User.exists({SID});
  if(exists) {
    return next(new AppError('There is already an user with that SID',400))
  }
  let user = await User.create({
    email,
    password,
    confirmedPassword,
    student_type,
    name,
    SID,
  });
  // creating token here because creating in pre save hook will creat token everytime updating user happens like updat password, creating tokens
  const { hashed, unhashed } = generateHashedAndUnhashedCryptoToken(
    process.env.CRYPTO_ALGO,
    process.env.CRYPTO_BYTES_SHORT
  );

  const vote_token = await Token.create({ token: hashed, SID });
  user._v_t = vote_token._id;

  // send verification mail
  await createVerifyTokenAndSendMail(user, req, res, next);
});

exports.verify = catchAsyncError(async (req, res, next) => {
  const hashedToken = convertUnhashedToHashedCryptoToken(req.params.token);
  let user = await User.findOne({
    verifyToken: hashedToken,
    verifyTokenExpiresAt: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError("token", 404));
  }
  if (user.verified === true) {
    return next(new AppError("Your account is already verified", 400));
  }
  // remove the verify token
  user.verified = true;
  user.verifyToken = undefined;
  user.verifyTokenExpiresAt = undefined;
  await user.save({ validateBeforeSave: false });
  // create token for voting
  const votintTokenJWT = await createJWTCookie(
    { id: user._v_t },
    req,
    res,
    "_v_t",
    days(1)
  );
  const auth_token = createJWTCookie({ id: user._id }, req, res, "jwt");
  try {
    const url = `${process.env.FRONT_END}/login`;
    await new Email(user, url).sendWelcome();
    res.status(200).json(
      removeTokenFromResponseInDev(
        {
          status: "success",
          data: user,
          _v_t: votintTokenJWT,
          token: auth_token,
        },
        ["_v_t", "token"]
      )
    );
  } catch (error) {
    return next(new AppError("Error Sending Mail", 500));
  }
});

exports.login = catchAsyncError(async (req, res, next) => {
  if (!req.body.password || !req.body.email) {
    return next(new AppError("Please provide both email and password"));
  }
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new AppError("Invalid email or password", 404));
  }
  const isPasswordCorrect = await user.isCorrectPassword(
    password,
    user.password
  );
  if (!isPasswordCorrect) {
    return next(new AppError("Invalid email or password", 404));
  }
  if (user.verified === false) {
    return await createVerifyTokenAndSendMail(user, req, res, next);
  }
  // exclude passwrod from res
  user.password = undefined;
  const auth_token = createJWTCookie({ id: user._id }, req, res, "jwt");
  const vote_token = createJWTCookie(
    { id: user._v_t },
    req,
    res,
    "_v_t",
    days(1)
  );
  // remove token from response
  user._v_t = undefined;

  res.status(200).json(
    removeTokenFromResponseInDev(
      {
        status: "success",
        token: auth_token,
        _v_t: vote_token,
        data: user,
      },
      ["_v_t", "token"]
    )
  );
});

exports.logout = catchAsyncError(async (req, res, next) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + seconds(0)),
    sameSite: "None",
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https", //* heroku specific
  });
  res.status(200).json({
    status: "success",
  });
});

// guest login provide onetime token usage for a election
exports.guestLogin = catchAsyncError(async (req, res, next) => {
  const auth_token = getAuthTokenFromHeaderOrCookie(req, "_v_t");
  if (auth_token) {
    return next(
      new AppError("Guest login is not available for authenticated user", 400)
    );
  }

  if (!req.body.vote_token || !req.body._election) {
    return next(
      new AppError("Please provide both voting token and election", 400)
    );
  }
  const hashed = convertUnhashedToHashedCryptoToken(req.body.vote_token);
  const token = await Token.findOne({
    token: hashed,
    _election: req.body._election,
  });
  if (!token) {
    return next(new AppError("Invalid voting token", 400));
  }
  const votingTokenJWT = await createJWTCookie(
    { id: token._id },
    req,
    res,
    "_v_t",
    days(30)
  );
  res.status(200).json(
    removeTokenFromResponseInDev(
      {
        status: "success",
        _v_t: votingTokenJWT,
      },
      ["token", "_v_t"]
    )
  );
});

exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  if (!req.body.email) {
    return next(new AppError("Please provide email address"));
  }
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError(`There is no user with email ${req.body.email}`));
  }
  try {
    const resetToken = user.generateResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    const url = `${process.env.FRONT_END}/reset/${resetToken}`;
    console.log(url);
    await new Email(user, url).sendPasswordReset(resetToken, url);
    res.status(200).json({
      status: "success",
      message: "Password reset link has been sent to you email address",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError("Error sending email", 500));
  }
});

exports.resetPassword = catchAsyncError(async (req, res, next) => {
  const { email, password, confirmedPassword } = req.body;
  if (!email || !password || !confirmedPassword) {
    return next(
      new AppError("Please provide email, password and confirmedPassword", 400)
    );
  }
  const user = await User.findOne({
    email,
    passwordResetToken: convertUnhashedToHashedCryptoToken(req.params.token),
    passwordResetExpiresAt: { $gt: Date.now() },
  }).select("+password");
  if (!user) {
    return next(new AppError("Invalid email or token", 404));
  }
  // update password and validate again for password encryption
  user.password = password;
  user.confirmedPassword = confirmedPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpiresAt = undefined;
  await user.save();
  // excluding password from response
  user.password = undefined;
  const token = createJWTCookie({ user: user._id }, req, res, "jwt");
  res.status(200).json(
    removeTokenFromResponseInDev(
      {
        status: "success",
        token,
        data: user,
      },
      ["token", "_v_t"]
    )
  );
});
exports.updatePassword = catchAsyncError(async (req, res, next) => {
  const { email, oldPassword, newPassword, confirmedPassword } = req.body;
  if (!email || !oldPassword || !newPassword || !confirmedPassword) {
    return next(
      new AppError(
        "Please email, oldPassword, newPassword, confirmedPassword",
        400
      )
    );
  }
  const user = await User.findOne({ email }).select("+password");
  const isPasswordCorrect = await user.isCorrectPassword(
    oldPassword,
    user.password
  );
  if (!user || !isPasswordCorrect) {
    return next(new AppError("Invalid email or password", 404));
  }
  user.password = newPassword;
  user.confirmedPassword = confirmedPassword;
  await user.save();

  const token = createJWTCookie({ id: user._id }, req, res, "jwt");
  res.status(200).json(
    removeTokenFromResponseInDev(
      {
        status: "success",
        token,
      },
      ["token", "_v_t"]
    )
  );
});

exports.includeUserInfo = catchAsyncError(async (req, res, next) => {
  const token = getAuthTokenFromHeaderOrCookie(req, "jwt");
  console.log('jwt',token)
  if (!token) {
    return next();
  }
  const decodedJwt = await verifyJwtToken(token);
  const user = await User.findById(decodedJwt.id).select("+role");

  if (!user) {
    return next();
  }
  const pwdChangedAfterJwtIssued = user.passwordChangedAfterIssued(
    decodedJwt.iat
  );
  req.user = user;
  next();
});
