var mongoose = require('mongoose');

var projectSchema = mongoose.Schema({
  projectId: String,
  accountId: String,
  // tags: Array, //of objects of the tags
  color: String
})


module.exports = mongoose.model('Product', projectSchema);
