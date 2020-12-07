const { catchAsyncError } = require("../utils/error");
const { getQueryByParam } = require("../utils/query");
const AppError = require("../utils/AppError");

exports.createOne = (Model) => {
  return catchAsyncError(async (req, res, next) => {
    const doc = await Model.create({ ...req.body });
    res.status(201).json({
      status: "success",
      data: doc,
    });
  });
};

exports.getOne = (Model, populateOptions) => {
  return catchAsyncError(async (req, res, next) => {
    let query = getQueryByParam(Model, req.params.id);
    if (populateOptions) query = query.populate(populateOptions);
    const doc = await query;
    if (!doc) {
      return next(new AppError("Cannot find election", 404));
    }
    res.status(200).json({
      status: "success",
      data: doc,
    });
  });
};

exports.updateOne = (Model) => {
  return catchAsyncError(async (req, res, next) => {
    let body = removeElectionTypeFromBody(req);
    const doc = await Model.findByIdAndUpdate(
      req.params.id,
      { ...body },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!doc) {
      return next(new AppError("Cannot find the election", 404));
    }
    res.status(200).json({
      status: "success",
      data: doc,
    });
  });
};

function removeElectionTypeFromBody(req) {
  if (`${req.originalUrl.split("/api/v1/elections").length > 1}`) {
    delete req.body.type;
  }
  return req.body;
}
