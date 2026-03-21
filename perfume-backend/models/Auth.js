const mongoose = require('mongoose');

const authSchema = new mongoose.Schema({
  password: { 
    type: String, 
    required: true 
  }
});

module.exports = mongoose.model('Auth', authSchema);