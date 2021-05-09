const AppError = require("../utils/AppError");
const { catchAsyncError } = require("../utils/error");
const Ballot = require("../models/Ballot");
const User = require("../models/User");
const { excludeFromBodyExcept } = require("../utils/utils");
const { createVerifyTokenAndSendMail } = require("../utils/email");
const handler = require("../factory/handler");
const Log = require("../models/Log");

exports.createUser = handler.createOne(User);
exports.deleteUser = handler.deleteOne(User);
exports.getUser = handler.getOne(User);
exports.getUsers = handler.getAll(User);

exports.updateMe = catchAsyncError(async (req, res, next) => {
  if (req.body.password) {
    return next(new AppError("Password can't be updated on this route", 400));
  }
  // filter the allowed body
  const sanitizedBody = excludeFromBodyExcept(
    { ...req.body },
    "email",
    "name",
    "photo"
  );
  const user = await User.findByIdAndUpdate(req.user.id, sanitizedBody, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return next(new AppError("User no longer exists", 404));
  }
  if (sanitizedBody.email) {
    user.verified = false;
    await user.save({ validateBeforeSave: false });
    await createVerifyTokenAndSendMail(user, req, res, next);
    return;
  }
  // // update cache
  // await RedisCache.setRecord(req.user.id, JSON.stringify(user));
  res.status(200).json({
    status: "success",
    data: user,
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.isVerified = catchAsyncError(async (req, res, next) => {
  if (!req.user.verified) {
    return next(
      new AppError(
        "Your account is not verified yet. Please Log in again to receive a verfication email",
        400
      )
    );
  }
  next();
});

// get user's vote status on a candidate for a position in a election
exports.getVoteStatus = catchAsyncError(async (req, res, next) => {
  const {
    election: _election,
    position: _post,
  } = req.body;

  const voted = await Ballot.exists({
    _election,
    _post,
    _v_t:req.voting_token_id,
  });
  const statusCode = voted ? 200 : 400;
  const status = voted ? "success" : "error";
  res.status(statusCode).json({
    status,
  });
});

exports.addMod = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("Cannot find the user", 404));
  }
  if (user.role === "admin" || user.role === "mod") {
    return next(
      new AppError("This user already have Admin or Moderator priviledges", 400)
    );
  }
  user.role = "mod";
  user.save({ validateBeforeSave: false });
  const log = await Log.create({
    type: "add",
    by: req.user.email,
    resource: `${user.email} as Moderator`,
  });
  res.status(200).json({
    status: "success",
    data: user,
  });
});

exports.removeMod = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email, role: "mod" });
  if (!user) {
    return next(
      new AppError("There is no moderator with that email address", 404)
    );
  }
  user.role = "user";
  user.save({ validateBeforeSave: false });
  res.status(200).json({
    status: "success",
    data: user,
  });
});

exports.getAuthorities = catchAsyncError(async (req, res, next) => {
  const authorities = await User.find({
    $or: [{ role: "admin" }, { role: "mod" }],
  });
  res.status(200).json({
    status: "success",
    results: authorities.length,
    data: authorities,
  });
});

// exports.checkCache = handler.checkCache((req) => {
//   return req.user.id;
// });
