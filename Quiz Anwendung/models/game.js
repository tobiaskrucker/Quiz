const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  
  round: Number,
  questionCount: Number,
  points1: Number,
  points2: Number,
  modus: [String],

  users: [{
    type: mongoose.ObjectId,
    ref: 'User'
  }],

  questions: [{
    type: mongoose.ObjectId,
    ref: 'Question'
  }],

  module: [{
    type: mongoose.ObjectId,
    ref: 'Module'
  }],

  answers1: [Boolean],

  answers2: [Boolean],

});

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
