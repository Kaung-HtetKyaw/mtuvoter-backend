const { catchAsyncError } = require("../utils/error");
const { getQueryByParam } = require("../utils/query");
const AppError = require("../utils/AppError");
const APIFeatures = require("../factory/API_Features");
const Storage = require("../services/Storage/Storage");
const { v4: uuid } = require("uuid");

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

exports.getAll = (Model, filterCb) => {
  return catchAsyncError(async (req, res, next) => {
    let filter = filterCb ? filterCb(req) : {};
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .limitFields()
      .sort()
      .paginate();
    const docs = await features.query;
    res.status(200).json({
      status: "success",
      data: docs,
    });
  });
};

exports.deleteOne = (Model) => {
  return catchAsyncError(async (req, res, next) => {
    await Model.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: "success",
      data: null,
    });
  });
};

function removeElectionTypeFromBody(req) {
  if (`${req.originalUrl.split("/api/v1/elections").length > 1}`) {
    delete req.body.type;
  }
  return req.body;
}

exports.uploadFile = (storage, type, Model) => {
  return catchAsyncError(async (req, res, next) => {
    let filename = `${uuid()}.jpeg`;
    if (req.params.id) {
      const doc = await Model.findById(req.params.id).select("+photo");
      filename = doc.photo;
    }
    // upload file to local machine
    await storage
      .upload(req.file.buffer, filename, type)
      .then(() => {
        req.file.filename = filename;
      })
      .catch((err) => {
        console.log(err);
        return next(new AppError("Error uploading image", 500));
      });

    return next();
  });
};
