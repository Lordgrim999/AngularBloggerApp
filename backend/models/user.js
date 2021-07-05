const mongoose = require('mongoose');
//this will acts as a plugin to our schema
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },
});
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
