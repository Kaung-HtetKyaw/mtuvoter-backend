const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
   name:{
      type:String,
      required:[true,'Postion must have a name']
   },
   description:{
      type:String,
      required:[true,'Postion must have a description']
   },
   _election:{
      type:mongoose.Schema.ObjectId,
      ref:'Election',
      required:[true,'A Postion must belong to an election']
   }
})