const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question:String,
  rightAnswer: String,
  answer2: String,
  answer3: String,
  answer4: String,
  explanation: String,
  module: {
    type: mongoose.ObjectId,
    ref: 'Module'
  }

});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
