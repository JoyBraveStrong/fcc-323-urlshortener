var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var shortid = require("shortid");

var Url = new Schema({
	original_url: {type: String, required: true},
	short_id: {type: String, required: true, default: shortid.generate}
});

module.exports = mongoose.model('Url', Url);
