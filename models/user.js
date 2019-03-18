var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var schema = require("./schemas").User;

var UserSchema = new mongoose.Schema(schema);

UserSchema.plugin(passportLocalMongoose);

var User = mongoose.model("User", UserSchema);

module.exports = User;
