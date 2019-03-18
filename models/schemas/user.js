var mongoose = require("mongoose");
module.exports = {
  id: {
    type: Number,
    index: true
  },
  firstName: String,
  surname: String,
  dob: Date, // Date of birth
  description: String,
  thumbnail: String,
  city: String,
  created: {
    type: Date,
    default: Date.now
  }
};
