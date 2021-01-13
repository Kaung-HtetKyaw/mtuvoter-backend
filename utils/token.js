const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { promisify } = require("util");
const { days } = require("./time");

exports.generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_TOKEN_EXPIRES_IN,
  });
};

exports.createJWTCookie = (
  payload,
  req,
  res,
  cookieName,
  expiresIn = days(60)
) => {
  const token = this.generateToken(payload);
  let cookieOptions = {
    expires: new Date(Date.now() + expiresIn),
    httpOnly: true,
    //  secure: req.secure || req.headers["x-forwarded-proto"] === "https", //* heroku specific
  };
  res.cookie(cookieName, token, cookieOptions);
  return token;
};

exports.getCookieFromRequest = (req, cookieName) => {
  if (req.cookies[cookieName]) {
    return req.cookies[cookieName];
  }
  return undefined;
};

exports.getAuthTokenFromHeaderOrCookie = (req, cookieName) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    return req.headers.authorization.split(" ")[1];
  } else if (req.cookies[cookieName]) {
    return req.cookies[cookieName];
  }
};

exports.generateHashedAndUnhashedCryptoToken = (algorithm, bytes) => {
  const unhashed = crypto.randomBytes(Number(bytes)).toString("hex");
  const hashed = crypto.createHash(algorithm).update(unhashed).digest("hex");
  return { unhashed, hashed };
};

exports.convertUnhashedToHashedCryptoToken = (unhashed) => {
  return crypto
    .createHash(process.env.CRYPTO_ALGO)
    .update(unhashed)
    .digest("hex");
};

exports.verifyJwtToken = async (token) => {
  return await promisify(jwt.verify)(token, process.env.JWT_SECRET);
};

exports.removeTokenFromResponseInDev = (res, tokens) => {
  let result = {};
  if (process.env.NODE_ENV === "production") {
    for (const key in res) {
      if (!tokens.includes(key)) {
        result[key] = res[key];
      }
    }
    return result;
  }
  return res;
};
