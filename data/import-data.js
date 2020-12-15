const mongoose = require("mongoose");
const fs = require("fs");

const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const Users = require("../models/User");

//connect to mongodb
const DB = process.env.DB.replace("<PASSWORD>", process.env.DB_PASSWORD);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log("DB connection successful!🔥");
  });

const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, "utf-8"));

const importData = async () => {
  try {
    await Users.create(users, { validateBeforeSave: false });
    console.log("Data sucessfully imported 😆");
    process.exit();
  } catch (error) {
    console.log(error);
  }
};
const deleteData = async () => {
  try {
    await Users.deleteMany();
    console.log("Data successfully deleted ❎");
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

if (process.argv[2] == "--import") {
  importData();
} else if (process.argv[2] == "--delete") {
  deleteData();
}
