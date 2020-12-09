const AppError = require("../utils/AppError");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { verifyJwtToken } = require("../utils/token");

const { getBaseUrl } = require("../utils/utils");
const { catchAsyncError } = require("../utils/error");
const {
  generateToken,
  convertUnhashedToHashedCryptoToken,
  getTokenFromCookieOrHeader,
} = require("../utils/token");
const { days } = require("../utils/time");
const Email = require("../services/Email");

exports.protect = catchAsyncError(async (req, res, next) => {
  const token = getTokenFromCookieOrHeader(req);
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
  const { email, password, confirmedPassword, student_type } = req.body;
  let user = await User.create({
    email,
    password,
    confirmedPassword,
    student_type,
  });
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

  try {
    const url = `${getBaseUrl(req)}/users/me`;
    await new Email(user, url).sendWelcome();
    res.status(200).json({
      status: "success",
      data: user,
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
  await createTokenAndRespond(user, req, res, 200, true);
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
  await createTokenAndRespond(user, req, res, 200, true);
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

  await createTokenAndRespond(user, req, res, 200, false);
});

// issue jwt token and respond back
function createTokenAndRespond(user, req, res, statusCode, includeData) {
  const token = generateToken({ id: user._id });
  let response = {
    status: "success",
    token,
  };
  if (includeData) {
    user.password = undefined;
    response.data = user;
  }
  let cookieOptions = {
    expires: new Date(Date.now() + days(60)),
    httpOnly: true,
    //  secure: req.secure || req.headers["x-forwarded-proto"] === "https", //* heroku specific
  };
  res.cookie("jwt", token, cookieOptions);
  res.status(statusCode).json(response);
}

async function createVerifyTokenAndSendMail(user, req, res, next) {
  try {
    const verifyToken = user.generateVerifyToken();
    await user.save({ validateBeforeSave: false });
    const url = `${getBaseUrl(req)}/api/v1/users/verify/${verifyToken}`;
    await new Email(user, url).sendVerfication();
    res.status(200).json({
      status: "success",
      message: "Verfication email has been sent to you email address",
    });
  } catch (error) {
    console.log(error);
    user.verifyToken = undefined;
    user.verifyTokenExpiresAt = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError("Error Sending email", 500));
  }
}
