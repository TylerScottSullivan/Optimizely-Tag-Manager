var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');
var snippets = require('../snippets');
var Handlebars = require('handlebars');

var projectSchema = mongoose.Schema({
  projectId: String,
  accountId: String,
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }]
});

var tagSchema = mongoose.Schema({
  name: String,
  tagDescription: String,
  fields: Array,
  trackingTrigger: String,
  trackingTriggerType: String,
  custom: String,
  rank: Number,
  projectId: String,
  active: Boolean,
  hasCallback: Boolean,
  callbacks: Array,
  pageName: String,
  eventName: String,
  template: String,
  displayName: String,
  customId: String
});

//tags, masters, innerCallback
tagSchema.methods.render = function(tags, masters) {
  //data structured {tags:, masters:, innerCallback:, template:}
  var filtered = [];
  // console.log("[stage inside render this:]", this);
  // console.log("[tags]", tags);
  // console.log('[masters]', masters);
  if (tags) {
    //filtered are the tags that this has as children ["*937249734", "GA"]
    console.log("TAGS", tags)
     filtered = tags.filter(function(item) {
       if (item.name === "custom") {
         console.log("THIS.CALLBACKS", this.callbacks, "ITEM", item.customId)
         return this.callbacks.includes(item.customId);
       }
       else {
         console.log("THIS.CALLBACKS", this.callbacks, "ITEM", item.name)
         return this.callbacks.includes(item.name);
       }
    }.bind(this));
    console.log('FINAL FILTERED', filtered)
  }
  // console.log('[filtered]', filtered);
  var innerCallback = '';
  for (var i = 0; i < filtered.length; i++) {
    innerCallback += filtered[i].render(tags, masters);
  }
  // console.log('innerCallback1', innerCallback);
  var index = Math.floor(Math.random()*1000);
  innerCallback="function callback" + index + " (){"+innerCallback+"}";
  // console.log('innerCallback2', innerCallback);

  var master = masters.filter(function(item) {
    return this.name === item.name;
  }.bind(this))[0];
  // console.log('myMaster', master);

  var handleBarsFields = {};

  for (var i = 0; i < this.fields.length; i++) {
    handleBarsFields[this.fields[i].name] = this.fields[i].value;
  }

  // console.log('[handlebarsFields]',handleBarsFields);
  var template;
  if (this.name === 'GA') {
    // console.log('[stage got inside GA tag]');
    innerCallback += 'callback' + index + '();';
    // console.log('[innerCallback after GA insertion]', innerCallback);
    template = Handlebars.compile(master.template);
  }

  handleBarsFields.callback = innerCallback;
  // console.log('[handleBarsFields after callback addition]', handleBarsFields);

  console.log("handleBarsFields", handleBarsFields)
  if (this.name === 'custom') {
    console.log('custom', this.name, this.template)
    template = Handlebars.compile(this.template);
  } else {
    template = Handlebars.compile(master.template);
  }
  var x = template(handleBarsFields);
  console.log("template(handleBarsFields);", x);
  return x;
};


var masterSchema = mongoose.Schema({
  name: String,
  displayName: String,
  tokens: Array,
  tagDescription: String,
  hasCallback: Boolean,
  approved: Boolean,
  callbackCode: String,
  template: String,
  usesOurCallback: Boolean
});


projectSchema.plugin(findOrCreate);
module.exports = {
  'Project': mongoose.model('Project', projectSchema),
  'Tag': mongoose.model('Tag', tagSchema),
  'Master': mongoose.model('Master', masterSchema)
};
