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
  addCallbacksBool: false,
  oldCallback: null,
  findMaster: function(project) {
    this.project = project;
    return Master.find()
  },
  findTagSetMasters: function(masters) {
    this.masters = masters;
    return Tag.findOne({"name": this.body.name, "projectId": this.project.projectId})
  },
  createTag: function(tag) {
    //storing all masters
    if (!tag || tag.name === "custom") {
      var fields = [];
      var master = this.masters.filter(function(item) {

        return item.name === this.body.name
      }.bind(this))[0];

      for(var i = 0; i < master.tokens.length; i++) {
        fields.push({
          'name': master.tokens[i]['tokenName'],
          'description': master.tokens[i]['description'],
          'value': this.body[master.tokens[i]['tokenName']]
        })
      };
      trackingTrigger = this.body.trackingTrigger.slice(this.body.trackingTrigger.indexOf(',') + 1);
      trackingTriggerType = this.body.trackingTrigger.slice(0, this.body.trackingTrigger.indexOf(','))
      displayName = this.body.displayName || master.displayName;

      console.log("TRACKING TRIGGERS", trackingTrigger, trackingTriggerType);
      t = new Tag({
        name: master.name,
        displayName: displayName,
        fields: fields,
        tagDescription: this.body.tagDescription,
        trackingTrigger: trackingTrigger,
        trackingTriggerType: trackingTriggerType,
        template: this.body.template,
        projectId: this.project.projectId,
        active: this.body.active,
        hasCallback: master.hasCallback,
        pageName: this.body.pageName,
        eventName: this.body.eventName
      })
      return t.save()
    }
    else {
      throw "Cannot create a tag twice"
    }
  },
  updateProject: function(tag) {
    this.project.tags.push(tag._id);
    return new Promise(function(resolve, reject) {
      if(tag.trackingTriggerType !== "onDocumentReady" && tag.trackingTriggerType !== "inHeader" && tag.trackingTriggerType !== "onPageLoad" && tag.trackingTriggerType !== "onEvent") {
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
                    return item.trackingTriggerType === "inHeader";
                  })
    var onDocumentReadys = tags.filter(function(item){
                              return item.trackingTriggerType === "onDocumentReady";
                            })
    var onPageLoads = tags.filter(function(item) {
                                  return item.trackingTriggerType === "onPageLoad"
                              })
    var onEvents = tags.filter(function(item) {
                                  return item.trackingTriggerType === "onEvent"
                                })
    //BUILDING IN HEADER JAVASCRIPT
    console.log('onEvents', onEvents)
    var inHeaderJavascript = '';
    for(var i = 0; i < inHeaders.length; i++) {
      //call render for each inHeader
      inHeaderJavascript += inHeaders[i].render(tags, this.masters);
    }
    //BUILDING ONDOCUMENTREADY JAVASCRIPT
    var onDocumentReadyJavascript = '';
    for(var i = 0; i < onDocumentReadys.length; i++) {
      //TODO: wrap this in onDocumentReady here, not in function
      onDocumentReadyJavascript += onDocumentReadys[i].render(tags, this.masters);
    }
    var pagesToIds = {'select_dropdown_1': "6824293401", "shopping_cart": "6824330423"}

    //BUILDING ON EVENT OBJECT
    var onEventsObject = {};
    var eventMarker = false;
    for(var i = 0; i < onEvents.length; i++) {
      marker = true;
      onEventsObject[onEvents[i].trackingTrigger] = onEvents[i].render(tags, this.masters);
      console.log('[onEventsObject]', onEventsObject);
    }


    console.log("onEventsObject", onEventsObject)
    onEventsObjectString = JSON.stringify(onEventsObject);
    onEventsObjectString = "var onEventsObjectFunction = function() {return " + onEventsObjectString + ";};"
    console.log("onEventsObjectString", onEventsObjectString);

    //BUILDING ON PAGE OBJECT
    var onPageLoadObject = {};
    var pageMarker = false;
    for(var i = 0; i < onPageLoads.length; i++) {
      pageMarker = true;
      onPageLoadObject[onPageLoads[i].trackingTrigger] = onPageLoads[i].render(tags, this.masters);
      console.log('[onPageLoadsObject]', onPageLoadObject);
    }
    onPageLoadsObjectString = JSON.stringify(onPageLoadObject);
    onPageLoadsObjectString = "var onPageLoadsObjectFunction = function() {return " + onPageLoadsObjectString + ";};"


    var onSpecificEventJavascript = '';
    if (eventMarker || pageMarker) {
      onSpecificEventJavascript = "window.optimizely.push({type: 'addListener',filter: {type: 'analytics',name: 'trackEvent',},handler: function(data) {console.log('Page', data.name, 'was activated.');if(data.data.type === 'pageview'){console.log('apiName',data.data.apiName);eval(onPageLoadsObjectFunction()[data.data.apiName]);}else{eval(onEventsObjectFunction()[data.data.apiName]);};}});"
      onSpecificEventJavascript = '$(document).ready(function(){' +onSpecificEventJavascript+ '});'
    }

    console.log("onSpecificEventJavascript", onSpecificEventJavascript)
    // console.log("marker", marker)
    //wrap onDocumentReadyJavascript in an on document ready
    onDocumentReadyJavascript = '$(document).ready(function(){' +onDocumentReadyJavascript+ '});'


    //combine built javascript
    this.combinedJavascript = onEventsObjectString + onPageLoadsObjectString + inHeaderJavascript + onDocumentReadyJavascript + onSpecificEventJavascript;

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
    var j = JSON.parse(response).project_javascript;


    //get start section
    originalJavascriptStartSectionIndex = j.indexOf('//--------------------HorizonsJavascriptStart--------------------');
    var originalJavascriptStartSection = ''
    if (originalJavascriptStartSectionIndex !== -1) {
      originalJavascriptStartSection = j.slice(0, originalJavascriptStartSectionIndex);
    }

    //get end section
    originalJavascriptEndSectionIndex = j.indexOf('\n//--------------------HorizonsJavascriptEnd--------------------') + 64;
    var originalJavascriptEndSection = '';
    if (originalJavascriptEndSectionIndex !== -1) {
      originalJavascriptEndSection = j.slice(originalJavascriptEndSectionIndex)
    }

    //add our javascript piece to the originalJavascriptStartSection
    var finalJavascript = originalJavascriptStartSection + "//--------------------HorizonsJavascriptStart--------------------\n" + this.combinedJavascript + '\n//--------------------HorizonsJavascriptEnd--------------------' + originalJavascriptEndSection;
    var token = process.env.API_TOKEN;
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
    this.project = project;
    return Tag.find({'hasCallback': true, 'projectId': this.project.projectId, "active": true});
  },
  getOptions: function(tags) {
    if (tags.length === 0) {
      this.tagNames = ['onTrigger,inHeader', 'onTrigger,onDocumentReady'];
    }
    //get names of options
    this.tagNames = tags.map(function(item) {
      return "onTrigger," + item.name;
    });


    //inHeader/onDocumentReady should intuitively come first
    this.tagNames.unshift("inHeader,inHeader");
    this.tagNames.unshift("onDocumentReady,onDocumentReady");

    //save current tags
    this.tags = tags;

    //make call to optimizely for all pages associated with the id
    var token = process.env.API_TOKEN;
    return rp({
         uri: "https://www.optimizelyapis.com/v2/events?project_id=" + this.body.projectId,
         method: 'GET',
         headers: {
           "Token": token,
           "Content-Type": "application/json"
         }
       })

  },
  getPageOptions: function(events) {
    if (!events) {
      events = "[]";
    }
    this.events = events;
    var token = process.env.API_TOKEN;
    return rp({
         url: "https://www.optimizelyapis.com/v2/pages?project_id=" + this.body.projectId,
         method: 'GET',
         headers: {
           "Token": token,
           "Content-Type": "application/json"
         }
       })
  },
  addProjectOptions: function(pages) {
    if (!pages) {
      pages = "[]"
    }

    var pageNames = JSON.parse(pages).map(function(item) {
      return "onPageLoad," + item.api_name;
    })

    var eventNames = JSON.parse(this.events).map(function(item) {
      return "onEvent," + item.api_name;
    })

    var toReturn = this.tagNames.concat(pageNames);
    return toReturn.concat(eventNames);
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
    project.tags.splice(project.tags.indexOf(this.tagid), 1);
    return project.save();
  },
  setMaster: function(masters) {
    //set the master and find the correct tag
    this.masters = masters;
    return Tag.findById(this.tagid)
  },
  updateTag: function(tag) {
    console.log('[tag in updateTag]', tag)
    console.log('[masters in updateTag]', this.masters)
    var master = this.masters.filter(function(item) {
      return item.name === tag.name
    }.bind(this))[0];
    var fields = [];
    for(var i = 0; i < master.tokens.length; i++) {
      fields.push({'name': master.tokens[i]['tokenName'], 'description': master.tokens[i]['description'], 'value': this.body[master.tokens[i]['tokenName']]})
    }
    trackingTrigger = this.body.trackingTrigger.slice(this.body.trackingTrigger.indexOf(',') + 1);
    trackingTriggerType = this.body.trackingTrigger.slice(0, this.body.trackingTrigger.indexOf(','))
    if (trackingTriggerType === 'onTrigger') {
      this.tagid = tag._id;
      this.addCallbacksBool = true;
      this.oldCallback = tag.trackingTrigger;
    }

    tag.fields = fields;
    tag.approved = this.body.approved;
    tag.trackingTrigger = trackingTrigger;
    tag.trackingTriggerType = trackingTriggerType;
    tag.template = this.body.template;
    tag.projectId = this.body.projectId;
    tag.active = this.body.active;
    return tag.save();
  },
  chooseCallbackPath: function(tag) {
    //if they changed the trigger to be another snippet-- change the
    //callbacks of their current parent (if snippet), change the callbacks of their future
    //parent
      return new Promise(function(resolve, reject) {
        if(this.addCallbacksBool) {
          Tag.find({"projectId": tag.projectId})
             .then(this.removeCallbacks.bind(this))
             .then(this.addCallbacks.bind(this))
             .then(this.getProject.bind(this))
             .then((response)=>resolve(response))
             .catch(err=>reject(err))
        }
        else {
          project = this.getProject.bind(this, tag)()
          project.exec(function(err, p) {
            if (err) reject(err);
            resolve(p);
          })
          // resolve(project);
        }
      }.bind(this))
  },
  removeCallbacks: function(tags) {
    this.tags = tags;
    var myTag = tags.filter(function(item) {
      return item._id.toString() === this.tagid.toString();
    }.bind(this))[0];

    var tagWithCallback = tags.filter(function(item) {
      return item.callbacks.includes(myTag.name)
    })[0];

    if (myTag && tagWithCallback) {
      var index = tagWithCallback.callbacks.indexOf(myTag.name);

      //deleting 1 item at the index
      tagWithCallback.callbacks.splice(index, 1);
      return tagWithCallback.save();
    }
    else {
      return;
    }
  },
  addCallbacks: function() {
    var myTag = this.tags.filter(function(item) {
      return item._id.toString() === this.tagid.toString();
    }.bind(this))[0];

    var parentTag = this.tags.filter(function(item) {
      return item.name === myTag.trackingTrigger;
    })[0];

    if(parentTag) {
      parentTag.callbacks.push(myTag.name);
      return parentTag.save();
    } else {
      return myTag;
    }
  },
  removeTag: function(tag) {
    return Tag.remove({"_id": this.tagid});
  },
  // restrictOptions: function(tags) {

  // },
  // getChildren: function(tags, startingTag, list) {
  //
  //   var children = tags.filter(function(item) {
  //     startingTag.callbacks.includes(item.name)
  //   })
  //
  //   for(var i = 0; i < children.length; i++) {
  //     list.concat(getChildren(tags, children[i], list));
  //   }
  //   list.concat([startingTag.name]);
  //
  //   return list;
  // }
}
