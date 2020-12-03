const slugify = require("slugify");

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

exports.calculateReadTime = (content) => {
  const AVG_WPM = 265;
  const words_count = content.split(" ").length;
  const image = [...content.matchAll(/(?:!\[(.*?)\]\((.*?)\))/)].length * 10; // calculate inline image read time(simple version)
  const text = words_count / AVG_WPM < 1 ? 60 : words_count / AVG_WPM;
  return Math.floor((image + text) / 60);
};

exports.getBaseUrl = (req) => {
  return `${req.protocol}://${req.get("host")}`;
};

exports.createSlug = (title, author) => {
  let authorId = author;
  if (typeof author == "object") {
    authorId = author.id;
  }
  return `${slugify(title, {
    replacement: "-",
    lower: true,
  })}-${String(authorId).slice(-4)}`;
};

exports.getPaginationDetail = (limit, page) => {
  const pageNo = Number(page) || 1;
  const limitNo = Number(limit) || 10;
  const skip = (pageNo - 1) * limitNo;
  return { limitNo, pageNo, skip };
};
