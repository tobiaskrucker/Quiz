const mongoose = require('mongoose');

const selectedModuleSchema = new mongoose.Schema({
  name:String,
  questions: [{
    type: mongoose.ObjectId,
    ref: 'Question'
  }]

});

const SelectedModule = mongoose.model('SelectedModule', selectedModuleSchema);

module.exports = SelectedModule;
