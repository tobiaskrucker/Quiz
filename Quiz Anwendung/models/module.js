const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  name:String,
  questions: [{
    type: mongoose.ObjectId,
    ref: 'Question'
  }]

});

const Module = mongoose.model('Module', moduleSchema);

module.exports = Module;
