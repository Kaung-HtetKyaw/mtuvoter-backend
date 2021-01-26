const AppError = require("../utils/AppError");
const { catchAsyncError } = require("../utils/error");
const Ballot = require("../models/Ballot");
const User = require("../models/User");
const { excludeFromBodyExcept } = require("../utils/utils");
const { createVerifyTokenAndSendMail } = require("../utils/email");
const handler = require("../factory/handler");

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
    candidate: _candidate,
  } = req.body;

  const voted = await Ballot.exists({
    _election,
    _post,
    _candidate,
  });
  const statusCode = voted ? 400 : 200;
  const status = voted ? "error" : "success";
  res.status(statusCode).json({
    status,
  });
});

exports.addMod = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (user.role === "admin" || user.role === "mod") {
    return next(
      new AppError("This user already have Admin or Moderator priviledges", 400)
    );
  }
  user.role = "mod";
  user.save({ validateBeforeSave: false });
  if (!user) {
    return next(new AppError("Cannot find the user", 404));
  }
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
