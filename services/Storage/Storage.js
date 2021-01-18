const multer = require("multer");
const sharp = require("sharp");
const AppError = require("../../utils/AppError");
const cloudinaryUpload = require("./cloudinary");
const convertToBase64 = require("./datauri");
const { getImageNameFromUrl } = require("../../utils/utils");

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
  async getResizedBuffer(fileBuffer, width, height) {
    return await sharp(fileBuffer)
      .resize(width, height)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toBuffer();
  }
  // resize the file buffer
  async upload(fileBuffer, name, type) {
    const { width, height } = this.resize;
    await sharp(fileBuffer)
      .resize(width, height)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`public/images/${name}`);
  }
  async uploadToCloudinary(fileBuffer, method, existingPhoto) {
    let options = {};
    if (method === "PATCH") {
      if (!!existingPhoto)
        options.public_id = getImageNameFromUrl(existingPhoto);
    }
    const resizedImage = await this.getResizedBuffer(fileBuffer, 500, 500);
    const base64Image = convertToBase64(resizedImage);
    const uploadedImage = await cloudinaryUpload(base64Image.content, options);
    return uploadedImage.secure_url;
  }
};
