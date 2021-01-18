const mongoose = require("mongoose");
const AppError = require("../utils/AppError");
const { catchAsyncError } = require("../utils/error");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const cloudinary = require("cloudinary").v2;
const DatauriParser = require("datauri/parser");
const parser = new DatauriParser();
const sharp = require("sharp");

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

cloudinary.config({
  cloud_name: "mtuvoter",
  api_key: "995791191958857",
  api_secret: "xGgZu5Wa2qN-NEk6c0s1QoNA1Tk",
});

exports.multerBuffer = upload.single("photo");

exports.uploadImage = catchAsyncError(async (req, res, next) => {
  let resultImage;
  const imageBuffer = req.file.buffer;
  const resizedImage = await sharp(imageBuffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toBuffer();
  const base64Image = parser.format("jpeg", resizedImage);
  resultImage = await cloudinary.uploader.upload(base64Image.content);
  res.status(200).json({
    image: resultImage,
  });
});

exports.updateImage = catchAsyncError(async (req, res, next) => {
  let resultImage;
  const imageBuffer = req.file.buffer;
  const resizedImage = await sharp(imageBuffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toBuffer();
  const base64Image = parser.format("jpeg", resizedImage);
  resultImage = await cloudinary.uploader.upload(base64Image.content, {
    public_id: "c8sqcdz5qdh09fgkdytr",
  });
  res.status(200).json({
    image: resultImage,
  });
});
