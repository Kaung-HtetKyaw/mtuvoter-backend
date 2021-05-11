const AppError = require("../utils/AppError");
const { catchAsyncError } = require("../utils/error");
const Election = require("../models/Election");
const handler = require("../factory/handler");

exports.createElection = handler.createOne(Election);
exports.updateElection = handler.updateOne(Election);
exports.getElection = handler.getOne(
  Election,
  {
    path: "positions candidates",
    select: "-__v ",
  },
  true
);

// exports.checkCache = handler.checkCache((req) => {
//   return req.params.id || req.params.election;
// });

exports.getLatestElection = catchAsyncError(async (req, res, next) => {
  const election = await Election.findOne({
    endDate: {
      $lte: Date.now(),
    },
  }).populate("positions");

  res.status(200).json({
    status: "success",
    data: election,
  });
});

exports.getALlElections = handler.getAll(Election, (req) => {
  let result={};
  // check for year query
  let { year } = req.query;
  if (year) {
      result.startDate= {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-01`),
      }
  }
  // check for user info
  let isAuth = req.user && (req.user.role === 'admin' || req.user.role === 'mod');
  if(isAuth) {
    result.published = true
  }
   return {...result};

});
exports.deleteElection = handler.deleteOne(Election);

exports.started = catchAsyncError(async (req, res, next) => {
  // make sure election comes first
  const electionId = req.body.election || req.params.id || req.body._election;
  const election = await Election.findById(electionId).select("+startDate");
  if (Date.now() > new Date(election.startDate)) {
    return next(
      new AppError(
        "You cannot perform this action because election has already started",
        400
      )
    );
  }
  next();
});
exports.notStarted = catchAsyncError(async (req, res, next) => {
  // make sure election comes first
  const electionId = req.body.election || req.params.id || req.body._election;
  const election = await Election.findById(electionId).select("+startDate");
  if (Date.now() < new Date(election.startDate)) {
    return next(
      new AppError(
        "You cannot perform this action because election has not started yet",
        400
      )
    );
  }
  next();
});

exports.raced = catchAsyncError(async (req, res, next) => {
  const electionID =
    req.body.election || req.params.election || req.body._election;
  if (!electionID) {
    return next(new AppError("Invalid election", 404));
  }
  const election = await Election.findById(electionID).select("+startDate");
  if (Date.now() > election.endDate) {
    return next(
      new AppError(
        "You cannot perform this action because election has already been called raced",
        400
      )
    );
  }
  next();
});


exports.publishElection = catchAsyncError(async (req,res,next) => {
  await changeElectionPublishedFlag(req,res,next,true)
})

exports.unpublishElection = catchAsyncError(async (req,res,next) => {
  await changeElectionPublishedFlag(req,res,next,false);
})

async function changeElectionPublishedFlag(req,res,next,flag) {
  let election = await Election.findByIdAndUpdate(req.params.id,{published:flag},{
    new:true,
    runValidators:true
  });
  if(!election) {
    return next(new AppError("Election no longer exists",404))
  }
  res.status(200).json({
    status:'success',
    data:election
  })
}