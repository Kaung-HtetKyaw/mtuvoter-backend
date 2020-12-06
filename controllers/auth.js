const AppError = require("../utils/AppError");
const User = require("../models/User");

const { getBaseUrl } = require("../utils/utils");
const { catchAsyncError } = require("../utils/error");
const { generateToken } = require("../utils/token");
const { days } = require("../utils/time");
const Email = require("../services/Email");
const crypto = require("crypto");
const { get } = require("http");

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
  const hashedToken = crypto
    .createHash(process.env.CRYPTO_ALGO)
    .update(req.params.token)
    .digest("hex");
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
  const user = await User.findOne({ email });
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

// issue jwt token and respond back
function createTokenAndRespond(user, req, res, statusCode, includeData) {
  const token = generateToken({ id: user._id });
  let response = {
    status: "success",
    token,
  };
  if (includeData) {
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
