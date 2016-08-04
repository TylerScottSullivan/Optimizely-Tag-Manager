var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate')
var snippets = require('../snippets')

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
  approved: Boolean,
  hasCallback: Boolean,
  callbacks: Array
})

tagSchema.methods.render = function() {
  //TODO: change to this.trackingTrigger
  var innerCallback = '';
  for (var i = 0; i < this.callbacks.length; i++) {
    innerCallback += this.callbacks[i].render();
  }

  return snippets[this.name](this.fields, this.trackingTrigger, innerCallback);
}

var masterSchema = mongoose.Schema({
  name: String,
  tokens: Array,
  tagDescription: String,
  hasCallback: Boolean
})


projectSchema.plugin(findOrCreate);
module.exports = {
  'Project': mongoose.model('Project', projectSchema),
  'Tag': mongoose.model('Tag', tagSchema),
  'Master': mongoose.model('Master', masterSchema)
  }
