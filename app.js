var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const cors = require("cors");
const passport = require("passport");
const Pusher = require("pusher");

const AppError = require("./utils/AppError");
const globalErrorHandler = require("./controllers/error");

const { minutes } = require("./utils/time");

var app = express();
// enable cors
app.use(cors());
// handle options req for preflight case
app.options("*", cors());

// GLOBAL MIDDLEWARES
//set http headers (need to be before any req res cycle)
app.use(helmet());
// view engine setup
app.set("view engine", "jade");
app.set("views", path.join(__dirname, "views"));

if (process.env.NODE_ENV == "development") {
  app.use(logger("dev"));
}
app.use(passport.initialize());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// rate limiting
const limiter = rateLimit({
  max: 800,
  windowMs: minutes(15),
  message: "Too Many requests from this IP. Please try again in an hour",
});
app.use("/api", limiter);
app.use(compression());

app.get("/", function (req, res, next) {
  res.render("index");
});
// API
app.get("/api/testing", function (req, res, next) {
  const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_API_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
  });

  pusher.trigger("my-channel", "my-event", {
    message: "hello world",
  });
  res.status(200).json({
    status: "success",
  });
});

// catch 404 and forward to error handler
app.all("*", (req, res, next) => {
  next(new AppError(`cannot find ${req.originalUrl} on this server`, 404));
});

// error handler
app.use(globalErrorHandler);

module.exports = app;
