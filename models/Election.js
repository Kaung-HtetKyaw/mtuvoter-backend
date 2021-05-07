const mongoose = require("mongoose");
const slugify = require("slugify");
const { days, hours } = require("../utils/time");
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
      required: [true, "Provide the election's name"],
    },
    // new Date('2020-12-12:06:00:00')
    startDate: {
      type: Date,
      required: [true, "Election must have a start date"],
    },
    endDate: {
      type: Date,
      required: [true, "Election must have a end date"],
    },
    about: {
      type: String,
      required: [true, "Please describe summary about the election"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    delete: {
      type: Boolean,
      default: false,
      select: false,
    },
    published: {
      type: Boolean,
      default: true,
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

electionSchema.path("startDate").validate(function (value) {
  return new Date(value) > Date.now() + hours(6);
}, "Start Date must be at least 6 hours from now");

electionSchema.path("endDate").validate(function (value) {
  if(this.getUpdate) {
    return new Date(value) > new Date(this.getUpdate().$set.startDate);
  }
  return new Date(value) > new Date(this.startDate);
  
}, "End date must be greater than the start date");

// raced? field to verify the election is over
electionSchema.virtual("raced").get(function () {
  return Date.now() > this.endDate;
});

electionSchema.virtual("positions", {
  ref: "Post",
  foreignField: "_election",
  localField: "_id",
});

electionSchema.virtual("candidates", {
  ref: "Candidate",
  foreignField: "_election",
  localField: "_id",
});

electionSchema.pre(/^find/, async function (next) {
  this.find({ published: true });
  next();
});
electionSchema.pre("find", function (next) {
  this.sort("-startDate");
  next();
});

// !delete everything related to the deleted election
// not implementing yet because i think it's too risky to delete everything related
// electionSchema.pre('findOneAndDelete',function(next) {
//   this.deletedElectionId = await this.findOne().select("+id");
//   next();
// })

// electionSchema.post('findOneAndDelete',function() {
//   await Post.deleteMany({_election:mongoose.Types.ObjectId(this.deletedElectionId)})
//   await Candidate.deleteMany({_election:mongoose.Types.ObjectId(this.deletedElectionId)})
// })

const Election = mongoose.model("Election", electionSchema);
module.exports = Election;
