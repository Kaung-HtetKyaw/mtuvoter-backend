const Storage = require("./Storage");
const AWS = require("aws-sdk");
const { noop } = require("../../utils/utils");
const AppError = require("../../utils/AppError");

module.exports = class AWSS3 extends (
  Storage
) {
  constructor(resize) {
    super(resize);
    this.config = {
      apiVersion: "2006-03-01",
      accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_S3_ACCESS_SECRET_KEY,
      region: process.env.AWS_S3_REGION,
    };
    this.s3 = new AWS.S3(this.config);
  }

  upload(fileBuffer, name, folder, cb = noop) {
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `${folder ? folder + "/" : ""}${this.type}-${this.name}`,
      Body: fileBuffer,
    };
    this.s3.upload(uploadParams, function (err, data) {
      if (err) {
        console.log(err);
        throw new AppError("Error uploading image", 500);
      }
      if (data) {
        console.log(data);
        cb(data);
      }
    });
  }
};
