const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
   name:{
      type:String,
      required:[true,'Place must have a name'],
      minlength:5,
      maxlength:100
   },
   
})