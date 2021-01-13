const AppError = require("../utils/AppError");
const { catchAsyncError } = require("../utils/error");
const { generateHashedAndUnhashedCryptoToken } = require("../utils/token");
const Token = require("../models/Token");
const User = require("../models/User");

// create vote token for guest user
exports.createVoteToken = catchAsyncError(async (req, res, next) => {
  let { SID, _election } = req.body;
  const userExists = await User.exists({ SID });
  if (userExists) {
    return next(new AppError("You already have an verified account.", 400));
  }
  const { hashed, unhashed } = generateHashedAndUnhashedCryptoToken(
    process.env.CRYPTO_ALGO,
    process.env.CRYPTO_BYTES_SHORT
  );
  const vote_token = await Token.create({ token: hashed, SID, _election });
  res.status(201).json({
    status: "success",
    vote_token: unhashed,
  });
});
