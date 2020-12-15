const mongoose = require("mongoose");
const AppError = require("../utils/AppError");
const { catchAsyncError } = require("../utils/error");
const Ballot = require("../models/Ballot");

exports.getBallotCountForCandidateByStudent = catchAsyncError(
  async (req, res, next) => {
    const { election, position, candidate } = req.body;
    const result = await Ballot.aggregate([
      {
        $match: {
          _election: mongoose.Types.ObjectId(election),
          _post: mongoose.Types.ObjectId(position),
          _candidate: mongoose.Types.ObjectId(candidate),
        },
      },
      {
        $group: {
          _id: "$student_type",
          vote_count: { $sum: 1 },
        },
      },
      {
        $addFields: { student_type: "$_id" },
      },
      {
        $project: { _id: 0 },
      },
      {
        $sort: { vote_count: -1 },
      },
    ]);
    res.status(200).json({
      status: "success",
      data: result,
    });
  }
);
