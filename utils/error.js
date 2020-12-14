// to propagate error to global error handler
exports.catchAsyncError = (cb) => {
  return (req, res, next) => {
    cb(req, res, next).catch((e) => next(e));
  };
};
