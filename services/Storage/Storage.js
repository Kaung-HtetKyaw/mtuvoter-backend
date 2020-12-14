const multer = require("multer");
const sharp = require("sharp");
const AppError = require("../../utils/AppError");

module.exports = class Storage {
  constructor(resize) {
    this.resize = resize || { width: 500, height: 500 };
  }
  createMulterUpload() {
    const multerStorage = multer.memoryStorage();
    const multerFilter = (req, file, cb) => {
      if (file.mimetype.startsWith("image")) {
        cb(null, true);
      } else {
        cb(new AppError("Invalid file type", 400));
      }
    };
    // upload file to memory as buffer
    const multerUpload = multer({
      storage: multerStorage,
      fileFilter: multerFilter,
    });
    return multerUpload;
  }
  // resize the file buffer
  async upload(fileBuffer, name, type) {
    const { width, height } = this.resize;
    await sharp(fileBuffer)
      .resize(width, height)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`public/images/${type}/${name}`);
  }
};
