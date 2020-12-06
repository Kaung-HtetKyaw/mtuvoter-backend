const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcryptjs");
const bcrypt_salt = process.env.BCRYPT_SALT;
const { seconds, minutes } = require("../utils/time");
const { generateHashedAndUnhashedCryptoToken } = require("../utils/token");
const { STUDENT_TYPE } = require("../utils/constants");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "User must provide an email address"],
    validate: {
      validator: isEmail,
      message: "Invalid email address",
    },
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password cant be empty"],
  },
  role: {
    type: String,
    default: "user",
    enum: {
      values: ["user", "mod", "admin"],
      message: "Invalid user role",
    },
  },
  confirmedPassword: {
    type: String,
    required: [true, "Conrimed Password can't be empty"],
    validate: {
      validator: function (value) {
        return this.password === value;
      },
    },
  },
  passwordChangedAt: Date,
  photo: {
    type: String,
    default: "default.jpg",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  passwordResetToken: String,
  passwordResetExpiresAt: Date,
  verifyToken: String,
  verifyTokenExpiresAt: Date,
  verified: {
    type: Boolean,
    default: false,
  },
  student_type: {
    type: String,
    required: [true, "Provide the current year you are attending"],
    enum: {
      values: STUDENT_TYPE,
      message: "Invalid student year",
    },
  },
});

userSchema.virtual("name").get(function () {
  return this.email.split("@")[0];
});

// only hash the password if the password is updated or new
userSchema.pre("save", async function (next) {
  console.log(bcrypt_salt);
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmedPassword = undefined;
  next();
});

// only exec for updating password
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  // making sure jwt issuing always finish after doc is saved
  this.passwordChangedAt = Date.now() - seconds(1);
  next();
});

userSchema.methods.isCorrectPassword = async function (plain, hash) {
  return await bcrypt.compare(plain, hash);
};

// checking if password was changed after jwt token was issued
userSchema.methods.passwordChangedAfterIssued = async function (iat) {
  if (this.passwordChangedAt) {
    const pwdChangedTime = parseInt(
      this.passwordChangedAt.getTime() / seconds(1),
      10
    );
    return pwdChangedTime > iat;
  }
  return false;
};

userSchema.methods.generateResetPasswordToken = function () {
  const { unhashed, hashed } = generateHashedAndUnhashedCryptoToken("sha256");
  this.passwordResetToken = hashed;
  this.passwordResetExpiresAt = Date.now() + minutes(10);
  return unhashed;
};

userSchema.methods.generateVerifyToken = function () {
  const { unhashed, hashed } = generateHashedAndUnhashedCryptoToken("sha256");
  this.verifyToken = hashed;
  this.verifyTokenExpiresAt = Date.now() + minutes(10);
  return unhashed;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
