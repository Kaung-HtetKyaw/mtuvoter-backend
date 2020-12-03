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
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

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

// API

// catch 404 and forward to error handler
app.all("*", (req, res, next) => {
  next(new AppError(`cannot find ${req.originalUrl} on this server`, 404));
});

// error handler
app.use(globalErrorHandler);

module.exports = app;
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
