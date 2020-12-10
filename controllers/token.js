const AppError = require("../utils/AppError");
const { catchAsyncError } = require("../utils/error");
const { generateHashedAndUnhashedCryptoToken } = require("../utils/token");
const User = require("../models/User");
const Token = require("../models/Token");

exports.createVoteToken = catchAsyncError(async (req, res, next) => {
  const { hashed, unhashed } = generateHashedAndUnhashedCryptoToken(
    process.env.CRYPTO_ALGO,
    process.env.CRYPTO_BYTES_SHORT
  );
  const vote_token = await Token.create({ token: hashed });
  res.status(201).json({
    status: "success",
    vote_token: unhashed,
  });
});
