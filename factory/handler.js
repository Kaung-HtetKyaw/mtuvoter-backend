const { catchAsyncError } = require("../utils/error");
const { getQueryByParam } = require("../utils/query");
const AppError = require("../utils/AppError");
const APIFeatures = require("../factory/API_Features");
const Storage = require("../services/Storage/Storage");
const { v4: uuid } = require("uuid");
const { noop } = require("../utils/utils");
// const RedisCache = require("../services/Cache");

exports.createOne = (Model) => {
  return catchAsyncError(async (req, res, next) => {
    const doc = await Model.create({ ...req.body });
    res.status(201).json({
      status: "success",
      data: doc,
    });
  });
};

exports.getOne = (Model, populateOptions = "", setCache, filterCb = noop) => {
  return catchAsyncError(async (req, res, next) => {
    let query = getQueryByParam(Model, req.params.id);
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

exports.updateOne = (Model, setCache, filterCb = noop) => {
  return catchAsyncError(async (req, res, next) => {
    const filter = filterCb(req) || req.params.id;
    let body = removeElectionTypeFromBody(req);
    const doc = await Model.findByIdAndUpdate(
      filter,
      { ...body },
      {
        new: true,
        runValidators: true,
      }
    );
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

exports.uploadFile = (storage, type, Model) => {
  return catchAsyncError(async (req, res, next) => {
    if (!req.file) {
      return next();
    }
    let filename = `${type}-${uuid()}.jpeg`;
    // take existing photo name if update
    if (req.method === "PATCH") {
      const docId = req.params.id || req.user.id;
      const doc = await Model.findById(docId).select("+photo");
      if (doc.photo) filename = doc.photo;
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
