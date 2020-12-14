const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
dotenv.config({ path: "./aws-cred.env" });
const mongoose = require("mongoose");

// put this before the app is initialized
process.on("uncaughtException", (error) => {
  console.error(error.name, error.message);
  console.log("UNCAUGHT EXCEPTION! SHUTTING DOWN.....❎");
  process.exit(1);
});

const app = require("./app");

// connect to mongodb
const DB = process.env.DB.replace("<PASSWORD>", process.env.DB_PASSWORD);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log("Database connection successful!🔥");
  });
// start the server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}🔥`);
});

// unhandle rejection
// finish all req and gracefully shut down server
process.on("unhandledRejection", (error) => {
  console.error(error.name, error.message);
  console.log("UNHANDLED REJECTIONS! GRACEFULLY SHUTTING.....🔏");
  server.close(() => {
    process.exit(1);
  });
});
