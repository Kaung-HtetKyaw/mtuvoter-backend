const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcryptjs");
const bcrypt_salt = process.env.BCRYPT_SALT;
const { seconds, minutes } = require("../utils/time");
const { generateHashedAndUnhashedCryptoToken } = require("../utils/token");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "User must provide an email address"],
    validate: {
      validator: isEmail,
      message: "Invalid email address",
    },
  },
  password: {
    type: String,
    required: [true, "Password cant be empty"],
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
  verfiyToken: String,
  verifyTokenExpiresAt: Date,
});

userSchema.virtual("name").get(function () {
  return this.email.split("@")[0];
});

// only hash the password if the password is updated or new
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, bcrypt_salt);
  this.confirmedPassword = undefined;
  next();
});

// only exec for updating password
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  // making sure jwt issuing always finish after doc is saved
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.isCorrectPassword = async function (plain, hash) {
  return await bcrypt.compare(plain, hash);
};

userSchema.methods.passwordChangedAfterIssued = async function (iat) {
  if (this.passwordChangedAt) {
    const pwdChangedTime = parseInt(
      this.passwordChangedAt.getTime() / 1000,
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
  this.verfiyToken = hashed;
  this.verifyTokenExpiresAt = Date.now() + minutes(10);
  return unhashed;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
