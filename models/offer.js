var mongoose = require("mongoose");

var schema = require("./schemas").Offer;

var OfferSchema = new mongoose.Schema(schema);

var Offer = mongoose.model("Offer", OfferSchema);

module.exports = Offer;
