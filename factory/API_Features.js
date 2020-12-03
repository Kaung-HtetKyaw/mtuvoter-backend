const { normalizeQueryString } = require("../query");
const { makeMap, getPaginationDetail } = require("../utils");

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    const excluded_query = makeMap("limit,page,sort,fields");
    this.query = this.query.find(
      normalizeQueryString(this.queryString, excluded_query)
    );
    return this;
  }
  limitFields() {
    if (this.queryString.fields) {
      const selectedFields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(selectedFields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }
  paginate() {
    const { limitNo, skip } = getPaginationDetail(
      this.queryString.limit,
      this.queryString.page
    );
    this.query = this.query.skip(skip).limit(limitNo);
    return this;
  }
}

module.exports = APIFeatures;
