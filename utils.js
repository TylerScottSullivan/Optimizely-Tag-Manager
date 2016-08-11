var express = require('express');
var router = express.Router();
var canvasSdk = require('optimizely-canvas-sdk');
var Project = require('./models/models').Project;
var Master = require('./models/models').Master;
var Tag = require('./models/models').Tag;
var rp = require('request-promise');
var snippets = require('./snippets')
var findOrCreate = require('mongoose-findorcreate')
var Handlebars = require('handlebars')

module.exports = {
  body: null,
  project: null,
  tagid: null,
  findMaster: function(project) {
    console.log("[stage] findMaster");
    this.project = project;
    return Master.find({})
  },
  createTag: function(masters) {
    console.log("[stage] createTag");
    //storing all masters
    this.masters = masters;
    var fields = [];
    // console.log('masterssss', masters)
    var master = masters.filter(function(item) {

      return item.name === this.body.name
    }.bind(this))[0];
    // console.log('master',  master)

    for(var i = 0; i < master.tokens.length; i++) {
      fields.push({
        'name': master.tokens[i]['tokenName'],
        'description': master.tokens[i]['description'],
        'value': this.body[master.tokens[i]['tokenName']]
      })
    }
    t = new Tag({
      name: master.name,
      displayName: this.body.displayName,
      fields: fields,
      tagDescription: this.body.tagDescription,
      trackingTrigger: this.body.trackingTrigger,
      template: this.body.template,
      projectId: this.project.projectId,
      active: this.body.active,
      hasCallback: master.hasCallback,
      pageName: this.body.pageName,
      eventName: this.body.eventName
    })
    console.log('this is the new tag', t)
    return t.save()
  },
  updateProject: function(tag) {
    console.log("[stage] updateProject");
    this.project.tags.push(tag._id);
    return new Promise(function(resolve, reject) {
      if(tag.trackingTrigger !== "onDocumentReady" && tag.trackingTrigger !== "inHeader" && tag.trackingTrigger !== "onPageLoad" && tag.trackingTrigger !== "onEvent") {
        Tag.findOne({"name": tag.trackingTrigger})
           .then(function(trackerTag) {
              trackerTag.callbacks.push(tag.name)
              return trackerTag.save()
            }.bind(this))
           .then(()=>resolve(this.project.save()))
           .catch(err=>reject(err))
      }
      else {
        resolve(this.project.save())
        }
      }.bind(this))
  },
  populateProject: function(updatedProject) {
    console.log("this is my updated project: ", updatedProject)
    return updatedProject.populate({path: 'tags'}).execPopulate()
  },
  getJavascript: function(populatedProject) {
    this.project = populatedProject;
    var tags = this.project.tags;

//do everything separately

    tags = tags.filter(function(item) {
      return item.active === true;
    })

    //wrap page type things
    var inHeaders = tags.filter(function(item){
                    return item.trackingTrigger === "inHeader";
                  })
    var onDocumentReadys = tags.filter(function(item){
                              return item.trackingTrigger === "onDocumentReady";
                            })
    var onPageLoads = tags.filter(function(item) {
                                  return item.trackingTrigger === "onPageLoad"
                              })
    var onEvents = tags.filter(function(item) {
                                  return item.trackingTrigger === "onEvent"
                                })

    var inHeaderJavascript = '';
    for(var i = 0; i < inHeaders.length; i++) {
      //call render for each inHeader
      inHeaderJavascript += inHeaders[i].render(tags, this.masters);
    }
    var onDocumentReadyJavascript = '';
    for(var i = 0; i < onDocumentReadys.length; i++) {
      //TODO: wrap this in onDocumentReady here, not in function
      onDocumentReadyJavascript += onDocumentReadys[i].render(tags, this.masters);
    }
    var pagesToIds = {'select_dropdown_1': "6824293401", "shopping_cart": "6824330423"}

    //to make callbacks work: we are going to know what the "checkFor" and "checkForType"
    //we are going to need to do this when we are rendering
    //we want to add var interval = window.setInterval(function(master.checkFor, innerCallback) { if(typeof(master.checkFor)) === master.checkForType {callback()}}, 2000 );
    //window.setTimeout(function(){ window.clearInterval(interval); }, 5000);
    //to the end of the code every time we render (only if they indicate they want it to be callBackable)

    //get all events call
    var onEventsObject = {};
    var marker = false;
    for(var i = 0; i < onEvents.length; i++) {
      marker = true;
      onEventsObject[onEvents[i].eventName] = onEvents[i].render(tags, this.masters);
    }

    onEventsObjectString = JSON.stringify(onEventsObject);
    onEventsObjectString = "var onEventsObjectFunction = function() {return " + onEventsObjectString + ";};"

    var onSpecificEventJavascript = '';
    if (marker) {
      onSpecificEventJavascript = "window.optimizely.push({type: 'addListener',filter: {type: 'analytics',name: 'trackEvent',},handler: function(data) {console.log('Page', data.name, 'was activated.');eval(onEventsObjectFunction()[data.id]);}});"
    }
    //wrap onDocumentReadyJavascript in an on document ready
    onDocumentReadyJavascript = '$(document).ready(function(){' +onDocumentReadyJavascript+ '});'

    //combine inHeaders and onDocumentReadys
    this.combinedJavascript = onEventsObjectString + inHeaderJavascript + onDocumentReadyJavascript + onSpecificEventJavascript;

    //getting original Javascript sections
    var token = process.env.API_TOKEN;
    return rp({
                     uri: "https://www.optimizelyapis.com/experiment/v1/projects/" + this.project.projectId,
                     method: 'GET',
                     headers: {
                       "Token": token,
                       "Content-Type": "application/json"
                     }
     })
  },
  buildJavascript: function(response) {
    console.log("[stage] buildJavascript");
    var j = JSON.parse(response).project_javascript;


    //get start section
    originalJavascriptStartSectionIndex = j.indexOf('//--------------------HorizonsJavascriptStart--------------------');
    var originalJavascriptStartSection = ''
    if (originalJavascriptStartSectionIndex !== -1) {
      originalJavascriptStartSection = j.slice(0, originalJavascriptStartSectionIndex);
    }

    //TODO: getEndSection
    originalJavascriptEndSectionIndex = j.indexOf('\n//--------------------HorizonsJavascriptEnd--------------------') + 64;
    var originalJavascriptEndSection = '';
    if (originalJavascriptEndSectionIndex !== -1) {
      originalJavascriptEndSection = j.slice(originalJavascriptEndSectionIndex)
    }

    //add our javascript piece to the originalJavascriptStartSection
    var finalJavascript = originalJavascriptStartSection + "//--------------------HorizonsJavascriptStart--------------------\n" + this.combinedJavascript + '\n//--------------------HorizonsJavascriptEnd--------------------' + originalJavascriptEndSection;
    var token = process.env.API_TOKEN;
    console.log("PUTTING", finalJavascript)
    return rp({
         uri: "https://www.optimizelyapis.com/experiment/v1/projects/" + this.project.projectId,
         method: 'PUT',
         json: {
           include_jquery: true,
           project_javascript: finalJavascript},
         headers: {
           "Token": token,
           "Content-Type": "application/json"
         }
       })
  },
  getTagOptions: function(project) {
    console.log('projectssss', project)
    this.project = project;
    return Tag.find({'hasCallback': true, 'projectId': this.project.projectId});
  },
  getOptions: function(tags) {
    console.log('tagsssss', tags)
        if (tags.length === 0) {
          this.tagNames = ['inHeader', 'onDocumentReady'];
          return '[]';
        }
        //get names of options
        this.tagNames = tags.map(function(item) {
          return item.name;
        });

        console.log('tagName', this.tagNames)

        //inHeader/onDocumentReady should intuitively come first
        this.tagNames.unshift("inHeader");
        this.tagNames.unshift("onDocumentReady");

        //save current tags
        this.tags = tags;

        //make call to optimizely for all pages associated with the id
        var token = process.env.API_TOKEN;
        return rp({
             uri: "https://www.optimizelyapis.com/v2/events?project_id=" + this.tags[i].projectId,
             method: 'GET',
             headers: {
               "Token": token,
               "Content-Type": "application/json"
             }
           })

        //send info
        //res.setHeader('Content-Type', 'application/json');
        //res.send(JSON.stringify(tags));
  },
  addProjectOptions: function(data) {
    var eventNames = JSON.parse(data).map(function(item) {
      return item.api_name;
    })
    return this.tagNames.concat(eventNames);
  },
  getProject: function(projectId, tagid) {
    if (tagid) {
      this.tagid = tagid;
    }
    //using this method for both passing in a projectId or a tag
    if(projectId.projectId) {
      projectId = projectId.projectId
    }
    return Project.findOne({'projectId': projectId})
  },
  removeTagFromProject: function(project) {
    console.log("project.tags 1", project.tags)
    console.log("project index", project.tags)
    project.tags.splice(project.tags.indexOf(this.tagid), 1);
    console.log("project.tags 2", project.tags)
    return project.save();
  },
  setMaster: function(master) {
    //set the master and find the correct tag
    this.master = master;
    return Tag.findById(req.params.tagid)
  },
  updateTag: function(tag) {
    // tag.name = req.body.name;
    for(var i = 0; i < this.master.tokens.length; i++) {
      fields.push({'name': this.master.tokens[i]['tokenName'], 'description': master.tokens[i]['description'], 'value': this.body[master.tokens[i]['tokenName']]})
    }
    tag.fields = fields;
    tag.approved = this.body.approved;
    tag.trackingTrigger = this.body.trackingTrigger;
    tag.template = this.body.template;
    tag.projectId = this.body.projectId;
    tag.active = this.body.active;
    return tag.save();
  }
}
