var mongoose = require('mongoose');
var findOneOrCreate = require('mongoose-find-one-or-create')

var projectSchema = mongoose.Schema({
  projectId: String,
  accountId: String,
  tags: [{
    type: mongoose.Schema.Type.ObjectId,
    ref: 'Tag'
  }]
})

var tagSchema = mongoose.Schema({
  name: String,
  description: String,
  accessToken: Array,
  trackingTrigger: String,
  custom: String,
  rank: Number,
  projectId: String,
  active: Boolean
})

projectSchema.plugin(findOneOrCreate);
module.exports = mongoose.model({
  'Project': projectSchema,
  'Tag': tagSchema
});
