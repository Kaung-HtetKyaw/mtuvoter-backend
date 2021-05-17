const Log = require("../models/Log");

exports.catchAsyncError = (cb) => {
  return (req, res, next) => {
    cb(req, res, next).catch((error) => next(error));
  };
};

exports.makeMap = (fields) => {
  const array = fields.split(",");
  let map = {};
  for (let i = 0, len = array.length; i < len; i++) {
    map[array[i]] = true;
  }
  return (property) => {
    return map[property] ? map[property] : false;
  };
};

exports.getBaseUrl = (req) => {
  return `${req.protocol}://${req.get("host")}`;
};

exports.getPaginationDetail = (limit, page) => {
  const pageNo = Number(page) || 1;
  const limitNo = Number(limit) || 10;
  const skip = (pageNo - 1) * limitNo;
  return { limitNo, pageNo, skip };
};

exports.capitalize = (string) => {
  return string[0].toUpperCase() + string.slice(1);
};

exports.noop = () => {};
exports.excludeFromBodyExcept = (body, ...fields) => {
  for (const key in body) {
    if (!fields.includes(key)) delete body[key];
  }
  return body;
};
exports.getResourceNameFromOriginalUrl = (url) => {
  return url.split("/api/v1/")[1].split("/")[0];
};
exports.createLog = async (type, req, id, resource) => {
  const log = await Log.create({
    type,
    by: req.user.email,
    resource:
      resource ||
      `${this.getResourceNameFromOriginalUrl(req.originalUrl)} ${id}`,
  });
};

exports.getImageNameFromUrl = (url) => {
  return url.match(/[\w-]+.(jpg|png|jpeg)/g)[0].split(".")[0];
};

exports.removeFieldsFromObj = (obj, fields) => {
  let result = {};
  for (const key in obj) {
    if (!fields.includes(key)) result[key] = obj[key];
  }
  return result;
};

exports.ConvertISODateToMMDate = function (date) {
  let originalDate = new Date(date);

  originalDate.setHours(originalDate.getHours() - 6);
  originalDate.setMinutes(originalDate.getMinutes() - 30);
  return originalDate;
}

exports.getFrontEndUrl = function () {
  if(process.env.NODE_ENV === 'production') return process.env.FRONT_END_PROD;
  return process.env.FRONT_END_DEV
}