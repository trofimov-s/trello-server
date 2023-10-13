const { Schema, model } = require('mongoose');
// const uniqueValidator = require('mongoose-unique-validator');

const userSchema = new Schema({
  fullname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExpiration: Date,
});

// userSchema.plugin(uniqueValidator);

module.exports = model('User', userSchema);
