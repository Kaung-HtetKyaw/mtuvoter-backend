const { catchAsyncError } = require("../utils/error");
const { getQueryByParam } = require("../utils/query");
const AppError = require("../utils/AppError");
const APIFeatures = require("../factory/API_Features");
const Storage = require("../services/Storage/Storage");
const {
  noop,
  getResourceNameFromOriginalUrl,
  removeFieldsFromObj,
  createLog,
} = require("../utils/utils");
// const RedisCache = require("../services/Cache");

exports.createOne = (Model) => {
  return catchAsyncError(async (req, res, next) => {
    let body = { ...req.body };
    if (req.file) body.photo = req.file.filename;
    const doc = await Model.create({ ...body });
    await createLog("create", req, doc._id);
    res.status(201).json({
      status: "success",
      data: doc,
    });
  });
};

exports.getOne = (Model, populateOptions = "", setCache, filterCb = noop) => {
  return catchAsyncError(async (req, res, next) => {
    let query = getQueryByParam(Model, req.params.id);
    console.log(req.user);
    if (populateOptions) query = query.populate(populateOptions);
    const doc = await query;
    if (!doc) {
      return next(new AppError("Cannot find election", 404));
    }
    // // set new record
    // if (setCache) {
    //   await RedisCache.setRecord(doc.id, JSON.stringify(doc));
    // }
    res.status(200).json({
      status: "success",
      data: doc,
    });
  });
};

exports.updateOne = (Model, filterCb = noop, setCache) => {
  return catchAsyncError(async (req, res, next) => {
    const filter = filterCb(req) || req.params.id;
    // strip imuutable property off from the body
    let body = removeFieldsFromObj(req.body, ["_id", "__v", "id"]);
    const doc = await Model.findByIdAndUpdate(
      filter,
      { ...body },
      {
        new: true,
        runValidators: true,
      }
    );

    await createLog("update", req, doc._id);
    if (!doc) {
      return next(new AppError("Cannot find the election", 404));
    }
    // // update the record
    // if (setCache) {
    //   await RedisCache.setRecord(doc.id, JSON.stringify(doc));
    // }
    res.status(200).json({
      status: "success",
      data: doc,
    });
  });
};

exports.getAll = (Model, filterCb, setCache, key) => {
  return catchAsyncError(async (req, res, next) => {
    let filter = filterCb ? filterCb(req) : {};
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .limitFields()
      .sort()
      .paginate();
    const docs = await features.query;
    // if (setCache) {
    //   await RedisCache.setRecord(key, JSON.stringify(docs));
    // }
    res.status(200).json({
      status: "success",
      data: docs,
    });
  });
};

exports.deleteOne = (Model) => {
  return catchAsyncError(async (req, res, next) => {
    await Model.findByIdAndDelete(req.params.id);
    await createLog("delete", req, req.params.id);
    // await RedisCache.del(req.params.id);
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

exports.uploadFile = (storage, Model) => {
  return catchAsyncError(async (req, res, next) => {
    let existingPhoto;
    if (!req.file) {
      return next();
    }
    if (!!req.params.id) {
      const doc = await Model.findById(req.params.id).select("photo");
      existingPhoto = doc.photo;
    }
    try {
      req.body.photo = await storage.uploadToCloudinary(
        req.file.buffer,
        req.method,
        existingPhoto
      );
      console.log("photo url ", req.body.photo);

      return next();
    } catch (error) {
      console.log(error);
      return next(new AppError("Error uploading image", 500));
    }
  });
};

exports.checkCache = (getKey) => {
  return catchAsyncError(async (req, res, next) => {
    const key = getKey(req);

    // const record = await RedisCache.checkCache(key);
    if (record) {
      return res.status(200).json({
        status: "success",
        data: JSON.parse(record),
      });
    }
    next();
  });
};
