// Load the AWS SDK for Node.js
var AWS = require("aws-sdk");
const path = require("path");
// Set the region
// let aws_cred = path.join(__dirname, "aws-cred.json");
// AWS.config.loadFromPath(aws_cred);
AWS.config.update({ region: "us-east-1" });

// Create S3 service object
s3 = new AWS.S3({ apiVersion: "2006-03-01" });

// call S3 to retrieve upload file to specified bucket
var uploadParams = { Bucket: "mtuvoter-user-bucket", Key: "", Body: "" };
var file = path.join(__dirname, "medium.jpeg");

// Configure the file stream and obtain the upload parameters
var fs = require("fs");
var fileStream = fs.createReadStream(file);
fileStream.on("error", function (err) {
  console.log("File Error", err);
});
uploadParams.Body = fileStream;
uploadParams.Key = path.basename(file);

// call S3 to retrieve upload file to specified bucket
s3.upload(uploadParams, function (err, data) {
  if (err) {
    console.log("Error", err);
  }
  if (data) {
    console.log("Upload Success", data.Location);
  }
});
