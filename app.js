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
const userRouter = require("./routes/users");
const electionRouter = require("./routes/elections");

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
app.use("/api/v1/users", userRouter);
app.use("/api/v1/elections", electionRouter);

// catch 404 and forward to error handler
app.all("*", (req, res, next) => {
  next(new AppError(`cannot find ${req.originalUrl} on this server`, 404));
});

// error handler
app.use(globalErrorHandler);

module.exports = app;
