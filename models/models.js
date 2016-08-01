var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate')

var projectSchema = mongoose.Schema({
  projectId: String,
  accountId: String,
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }]
})

var tagSchema = mongoose.Schema({
  name: String,
  tagDescription: String,
  fields: Array,
  trackingTrigger: String,
  custom: String,
  rank: Number,
  projectId: String,
  active: Boolean,
  approved: Boolean
})

var masterSchema = mongoose.Schema({
  name: String,
  tokens: Array,
  tagDescription: String
})


projectSchema.plugin(findOrCreate);
module.exports = {
  'Project': mongoose.model('Project', projectSchema),
  'Tag': mongoose.model('Tag', tagSchema),
  'Master': mongoose.model('Master', masterSchema)
  }
