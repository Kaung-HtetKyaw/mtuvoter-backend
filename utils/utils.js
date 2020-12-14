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
