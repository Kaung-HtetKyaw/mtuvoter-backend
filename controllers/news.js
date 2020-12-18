const mongoose = require("mongoose");
const AppError = require("../utils/AppError");
const { catchAsyncError } = require("../utils/error");
const handler = require("../factory/handler");
const News = require("../models/News");
const Email = require("../services/Email");
const User = require("../models/User");
const { getBaseUrl } = require("../utils/utils");

exports.checkCache = handler.checkCache((req) => {
  return req.params.id;
});

exports.createNews = catchAsyncError(async (req, res, next) => {
  const news = await News.create({ ...req.body });
  const users = await User.find({ subscribed: true }).select("+email");
  const emails = users.map((el) => el.email);
  const url = `${getBaseUrl}/news/${news.id}`;

  if (emails.length > 0) {
    await new Email(req.user, url).sendNewsNoti(emails, news);
  }
  res.status(201).json({
    status: "success",
    data: news,
  });
});
exports.updateNews = handler.updateOne(News, true);
exports.getAllNews = handler.getAll(News);
exports.getNews = handler.getOne(News, "", true);
exports.deleteNews = handler.deleteOne(News);
