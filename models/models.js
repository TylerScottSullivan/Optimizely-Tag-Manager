var mongoose = require('mongoose');

var projectSchema = mongoose.Schema({
  
  imageUri: String
})

module.exports = mongoose.model('Product', productSchema);
