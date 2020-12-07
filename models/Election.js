const mongoose = require("mongoose");
const slugify = require("slugify");
const { days } = require("../utils/time");
const { capitalize } = require("../utils/utils");
const AppError = require("../utils/AppError");

const options = {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
};

const electionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    // new Date('2020-12-12:06:00:00')
    startDate: {
      type: Date,
      required: [true, "Election must have a start date"],
    },
    endDate: {
      type: Date,
      required: [true, "Election must have a end date"],
      validate: {
        validator: function (value) {
          return value - this.startDate == days(1);
        },
      },
    },
    about: {
      type: String,
      required: [true, "Please describe summary about the election"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    type: {
      type: String,
      required: [true, "Election must have a type"],
      enum: {
        values: ["student", "teacher"],
        message: "Invalid election type",
      },
      lowercase: true,
    },
    slug: String,
    delete: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  options
);

electionSchema.index(
  {
    name: 1,
    startDate: 1,
    endDate: 1,
  },
  {
    unique: true,
  }
);
electionSchema.index({
  slug: 1,
});

// raced? field to verify the election is over
electionSchema.virtual("raced").get(function () {
  return Date.now() > this.endDate;
});

electionSchema.pre("save", function (next) {
  const curYear = this.createdAt.getFullYear();
  this.name = `${capitalize(this.type)} Union Election ${curYear}`;
  next();
});

electionSchema.pre("save", function (next) {
  const curYear = this.createdAt.getFullYear();
  this.slug = `${slugify(this.name, {
    replacement: "-",
    lower: true,
    strict: true,
  })}-${curYear}`;
  next();
});

const Election = mongoose.model("Election", electionSchema);
module.exports = Election;