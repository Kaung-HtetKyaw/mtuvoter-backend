const AppError = require("../utils/AppError");
const User = require("../models/User");
const Token = require("../models/Token");
const jwt = require("jsonwebtoken");
const { verifyJwtToken } = require("../utils/token");
const { createVerifyTokenAndSendMail } = require("../utils/email");

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
    console.log(req.user.role);
    console.log(roles);
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You are not authorized to perform this action", 401)
      );
    }
    next();
  };
};

exports.signup = catchAsyncError(async (req, res, next) => {
  console.log(req.body);
  const { email, password, confirmedPassword, student_type, name } = req.body;
  let user = await User.create({
    email,
    password,
    confirmedPassword,
    student_type,
    name,
  });
  // creating token here because creating in pre save hook will creat token everytime updating user happens like updat password, creating tokens
  const vote_token = await Token.create({});
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
    return next(new AppError("Invalid token", 404));
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
    const url = `${getBaseUrl(req)}/users/me`;
    await new Email(user, url).sendWelcome();
    res.status(200).json({
      status: "success",
      data: user,
      _v_t: votintTokenJWT,
      token: auth_token,
    });
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
  res.status(200).json({
    status: "success",
    token: auth_token,
    _v_t: vote_token,
    data: user,
  });
});

exports.logout = catchAsyncError(async (req, res, next) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + seconds(1)),
    httpOnly: true,
  });
  res.status(200).json({
    status: "success",
  });
});

// guest login provide onetime token usage for a election
exports.guestLogin = catchAsyncError(async (req, res, next) => {
  const auth_token = getAuthTokenFromHeaderOrCookie(req, "jwt");
  if (auth_token) {
    return next(
      new AppError("Guest login is not available for authenticated user", 400)
    );
  }

  if (!req.body.vote_token) {
    return next(new AppError("Please provide voting token", 400));
  }
  const hashed = convertUnhashedToHashedCryptoToken(req.body.vote_token);
  const token = await Token.findOne({ token: hashed });
  if (!token) {
    return next(new AppError("Invalid voting token", 400));
  }
  const votingTokenJWT = await createJWTCookie(
    { id: token._id },
    req,
    res,
    "_v_t",
    days(1)
  );
  res.status(200).json({
    status: "success",
    _v_t: votingTokenJWT,
  });
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
    const url = `${getBaseUrl(req)}/users/reset/${resetToken}`;
    await new Email(user, url).sendPasswordReset();
    res.status(200).json({
      status: "success",
      message: "Password reset link has been sent to you email address",
    });
  } catch (error) {
    console.log(error);
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
  const token = createJWTCookie({ user: _id }, req, res, "jwt");
  res.status(200).json({
    status: "success",
    token,
    data: user,
  });
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
  res.status(200).json({
    status: "success",
    token,
  });
});
