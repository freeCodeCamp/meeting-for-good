var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Meeting = new Schema({
  name: String,
  preferredTime: Date,
  preferredData: Date,
  participants: Array,
});

module.exports = mongoose.model('Meeting', Meeting);
