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
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const AppError = require("./utils/AppError");
const globalErrorHandler = require("./controllers/error");
// routers
const userRouter = require("./routes/users");
const electionRouter = require("./routes/elections");
const candidateRouter = require("./routes/candidate");
const positionRouter = require("./routes/position");
const voteRouter = require("./routes/vote");
const tokenRouter = require("./routes/token");
const ballotRouter = require("./routes/ballot");
const faqRouter = require("./routes/faq");
const newsRouter = require("./routes/news");

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

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// data sanitization (should be after body parser to clean after the body is parsed)
// against NOSQL query injections
app.use(mongoSanitize());
// against XSS
app.use(xss());
// prevent parameter pollution
app.use(hpp());

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
app.use("/api/v1/users", userRouter);
app.use("/api/v1/elections", electionRouter);
app.use("/api/v1/positions", positionRouter);
app.use("/api/v1/candidates", candidateRouter);
app.use("/api/v1/vote", voteRouter);
app.use("/api/v1/tokens", tokenRouter);
app.use("/api/v1/ballots", ballotRouter);
app.use("/api/v1/faqs", faqRouter);
app.use("/api/v1/news", newsRouter);
app.get("/", (req, res, next) => {
  res.render("index");
});

// catch 404 and forward to error handler
app.all("*", (req, res, next) => {
  next(new AppError(`cannot find ${req.originalUrl} on this server`, 404));
});

// error handler
app.use(globalErrorHandler);

module.exports = app;
