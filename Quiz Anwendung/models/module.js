const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  name:String
});

const Module = mongoose.model('Module', moduleSchema);

module.exports = Module;
