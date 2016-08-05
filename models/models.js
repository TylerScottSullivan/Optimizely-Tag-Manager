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
  callbacks: Array,
  pageName: String,
})


tagSchema.methods.render = function(tags) {
  var filtered = [];
  if (tags) {
     filtered = tags.filter(function(item) {
      return this.callbacks.includes(item.name)
    }.bind(this))
  }

  var innerCallback = '';
  for (var i = 0; i < filtered.length; i++) {
    innerCallback += filtered[i].render(tags);
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
