const jwt = require("jsonwebtoken");
const crypto = require("crypto");

exports.generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_TOKEN_EXPIRES_IN,
  });
};

exports.getTokenFromCookieOrHeader = (req) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    return req.headers.authorization.split(" ")[1];
  }
  //    else if (req.cookies.jwt) {
  //     return req.cookies.jwt;
  //   }
};

exports.generateHashedAndUnhashedCryptoToken = (algorithm) => {
  const unhashed = crypto.randomBytes(32).toString("hex");
  const hashed = crypto.createHash(algorithm).update(unhashed).digest("hex");
  return { unhashed, hashed };
};
