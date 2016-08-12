var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate')
var snippets = require('../snippets')
var Handlebars = require('handlebars')

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
  hasCallback: Boolean,
  callbacks: Array,
  pageName: String,
  eventName: String,
  template: String,
  displayName: String
})

//tags, masters, innerCallback
tagSchema.methods.render = function(tags, masters) {
  //data structured {tags:, masters:, innerCallback:, template:}
  var filtered = [];
  if (tags) {
     filtered = tags.filter(function(item) {
      return this.callbacks.includes(item.name)
    }.bind(this))
  }
  console.log("THIS", this)
  console.log("FILTERED", filtered)
  var innerCallback = '';
  for (var i = 0; i < filtered.length; i++) {
    innerCallback += filtered[i].render(tags, masters);
  }
  console.log("INNERCALLBACK", innerCallback)
  innerCallback="function(){"+innerCallback+"}"
  console.log("INNERCALLBACK2", innerCallback)
  var master = masters.filter(function(item) {
    return this.name === item.name
  }.bind(this))[0]
  console.log("MASTER", master)
  var handleBarsFields = {};

  for (var i = 0; i < this.fields.length; i++) {
    handleBarsFields[this.fields[i].name] = this.fields[i].value;
  }

  handleBarsFields['callback'] = innerCallback;

  console.log("HANDLEBARSFIELDS", handleBarsFields)
  if (this.name === 'custom') {
    var template = Handlebars.compile(this.template);
  } else {
    var template = Handlebars.compile(master.template);
  }
  return template(handleBarsFields);
}

var masterSchema = mongoose.Schema({
  name: String,
  displayName: String,
  tokens: Array,
  tagDescription: String,
  hasCallback: Boolean,
  approved: Boolean,
  callbackCode: String,
  template: String
})


projectSchema.plugin(findOrCreate);
module.exports = {
  'Project': mongoose.model('Project', projectSchema),
  'Tag': mongoose.model('Tag', tagSchema),
  'Master': mongoose.model('Master', masterSchema)
  }
