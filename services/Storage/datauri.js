const DataUriParser = require("datauri/parser");

const parser = new DataUriParser();

module.exports = (fileBuffer) => {
  return parser.format("jpeg", fileBuffer);
};
