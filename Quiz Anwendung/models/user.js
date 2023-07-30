const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email:String,
  username: String,
  password: String,
  role: String,
  games: Number,
  points: Number
});

const User = mongoose.model('User', userSchema);

module.exports = User;
