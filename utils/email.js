const Email = require("../services/Email");
const AppError = require("./AppError");
const { getBaseUrl } = require("./utils");

exports.createVerifyTokenAndSendMail = async (user, req, res, next) => {
  try {
    const verifyToken = user.generateVerifyToken();
    console.log(verifyToken)
    await user.save({ validateBeforeSave: false });
    // generate frontend url to display the verfication page
    const url = `${process.env.FRONT_END}/verify/${verifyToken}`;
    await new Email(user, url).sendVerfication(verifyToken);
    res.status(200).json({
      status: "success",
      message: "Verfication email has been sent to you email address",
    });
  } catch (error) {
    console.log(error);
    user.verifyToken = undefined;
    user.verifyTokenExpiresAt = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError("Error Sending email", 500));
  }
};
