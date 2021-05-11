const mongoose = require("mongoose");
const AppError = require("../utils/AppError");
const { catchAsyncError } = require("../utils/error");
const handler = require("../factory/handler");
const News = require("../models/News");
const Email = require("../services/Email");
const User = require("../models/User");
const { getBaseUrl, createLog } = require("../utils/utils");
const APIFeatures = require("../factory/API_Features");

const Storage = require("../services/Storage/Storage");

const storage = new Storage({ width: 500, height: 500 });
const multerUpload = storage.createMulterUpload();

exports.convertFileToBuffer = multerUpload.single("photo");
exports.uploadFile = handler.uploadFile(storage, News);

exports.createNews = catchAsyncError(async (req, res, next) => {
  const news = await News.create({ ...req.body });
  await createLog("create", req, news._id);

  res.status(201).json({
    status: "success",
    data: news,
  });
});

exports.publishNews = catchAsyncError(async (req,res,next) => {
  let news = await News.findByIdAndUpdate(req.params.id,{published:true},{
    new:true,
    runValidators:true
  })
  if(!news) {
    return next(new AppError("News no longer exists",404))
  }

  const users = await User.find({ subscribed: true }).select("+email");
  const emails = users.map((el) => el.email);
  const url = `${getBaseUrl}/news/${news.id}`;

  if (emails.length > 0) {
    await new Email(req.user, url).sendNewsNoti(emails, news);
  }

  res.status(200).json({
    status:"success",
    data:news
  })
})

exports.unpublishNews = catchAsyncError(async(req,res,next)=>{
  let news = await News.findByIdAndUpdate(req.params.id,{published:false},{
    new:true,
    runValidators:true
  })
  if(!news) {
    return next(new AppError("News no longer exists",404))
  }

  res.status(200).json({
    status:'success',
    data:news
  })

})


exports.updateNews = handler.updateOne(News);
exports.getAllNews = handler.getAll(News,(req)=>{
  let isAuth = req.user && (req.user.role === 'admin' || req.user.role === 'mod');
  return isAuth ? {} : {published:true}
});
exports.getNews = handler.getOne(News, "");
exports.deleteNews = handler.deleteOne(News);
