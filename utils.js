var express = require('express');
var router = express.Router();
var canvasSdk = require('optimizely-canvas-sdk');
var Project = require('./models/models').Project;
var Master = require('./models/models').Master;
var Tag = require('./models/models').Tag;
var rp = require('request-promise');
var snippets = require('./snippets');
var findOrCreate = require('mongoose-findorcreate');
var Handlebars = require('handlebars');

var utils = {
  body: null,
  project: null,
  tagid: null,
  addCallbacksBool: false,
  oldCallback: null,
  tag: null,
  findMaster: function(project) {
    this.project = project;
    return Master.find();
  },
  findTagSetMasters: function(masters) {
    this.masters = masters;
    return Tag.findOne({"name": this.body.name, "projectId": this.project.projectId});
  },
  createTag: function(tag) {
    //only create if tag does not exist
    if (!tag || tag.name === "custom") {
      var fields = [];
      var master = this.masters.filter(function(item) {
        console.log("ITEMS", item.name, this.body.name)
        return item.name === this.body.name;
      }.bind(this))[0];

      for(var i = 0; i < master.tokens.length; i++) {
        fields.push({
          'name': master.tokens[i].tokenName,
          'description': master.tokens[i].description,
          'value': this.body[master.tokens[i].tokenName]
        });
      }

      //CHECKS FOR PROPERLY FORMATTED DATA
      if (!this.body.trackingTrigger) {
        throw "Improperly formatted data: tracking triggers must be formatted trackingTriggerType,trackingTrigger";
      }
      if (this.body.trackingTrigger.indexOf(',') === -1) {
        throw "Improperly formatted data: tracking triggers must be formatted trackingTriggerType,trackingTrigger";
      }
      if (this.body.name.indexOf('*') !== -1) {
        throw "Improperly formatted data: name cannot contain reserved chars";
      }
      if (this.body.name.indexOf(' ') !== -1) {
        throw "Improperly formated data: name cannot include spaces";
      }
      //CHECKS FOR PROPERLY FORMATTED DATA

      //req.body.trackingTrigger is recieved [trackingTrigger],[trackingTriggerType]
      var trackingTrigger = this.body.trackingTrigger.slice(this.body.trackingTrigger.indexOf(',') + 1);
      var trackingTriggerType = this.body.trackingTrigger.slice(0, this.body.trackingTrigger.indexOf(','));
      displayName = this.body.displayName || master.displayName;

      // console.log("TRACKING TRIGGERS", trackingTrigger, trackingTriggerType);
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
        eventName: this.body.eventName,
        customId: "*"+this.body.customId
      });
      return t.save();
    }
    else {
      throw "Cannot create a tag twice";
    }
  },
  updateProject: function(tag) {
    this.tag = tag;
    this.project.tags.push(tag._id);
    return new Promise(function(resolve, reject) {
      //check if need to add callbacks to any tags
      if(tag.trackingTriggerType === "onTrigger") {
        Tag.findOne({"name": tag.trackingTrigger})
           .then(function(trackerTag) {
              if (tag.name === "custom") {
                trackerTag.callbacks.push(tag.customId);
              }
              else {
                trackerTag.callbacks.push(tag.name);
              }
              return trackerTag.save();
            }.bind(this))
           .then(() => resolve(this.project.save()) )
           .catch(err => reject(err) );
      }
      else {
        resolve(this.project.save());
      }
    }.bind(this));
  },
  populateProject: function(updatedProject) {
    return updatedProject.populate({path: 'tags'}).execPopulate();
  },
  getJavascript: function(populatedProject) {
    this.project = populatedProject;
    var tags = this.project.tags;

    tags = tags.filter(function(item) {
      return item.active === true;
    });

    //separate by category, as different tag types are wrapped differently post render
    var inHeaders = tags.filter(function(item){
      return item.trackingTriggerType === "inHeader";
    });

    var onDocumentReadys = tags.filter(function(item){
      return item.trackingTriggerType === "onDocumentReady";
    });

    var onPageLoads = tags.filter(function(item) {
      return item.trackingTriggerType === "onPageLoad";
    });
    var onEvents = tags.filter(function(item) {
      return item.trackingTriggerType === "onEvent";
    });

    //BUILDING IN HEADER JAVASCRIPT
    // console.log('onEvents', onEvents);
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
    //wrap in document.ready
    onDocumentReadyJavascript = '$(document).ready(function(){' +onDocumentReadyJavascript+ '});';

    //BUILDING ON EVENT OBJECT
    var onEventsObject = {};
    var eventMarker = false;
    for(var i = 0; i < onEvents.length; i++) {
      eventMarker = true;
      onEventsObject[onEvents[i].trackingTrigger] = onEvents[i].render(tags, this.masters);
      // console.log('[onEventsObject]', onEventsObject);
    }


    // console.log("onEventsObject", onEventsObject);
    onEventsObjectString = JSON.stringify(onEventsObject);
    onEventsObjectString = "var onEventsObjectFunction = function() {return " + onEventsObjectString + ";};";
    // console.log("onEventsObjectString", onEventsObjectString);

    //BUILDING ON PAGE OBJECT
    var onPageLoadObject = {};
    var pageMarker = false;
    for(var i = 0; i < onPageLoads.length; i++) {
      pageMarker = true;
      onPageLoadObject[onPageLoads[i].trackingTrigger] = onPageLoads[i].render(tags, this.masters);
      // console.log('[onPageLoadsObject]', onPageLoadObject);
    }
    onPageLoadsObjectString = JSON.stringify(onPageLoadObject);
    onPageLoadsObjectString = "var onPageLoadsObjectFunction = function() {return " + onPageLoadsObjectString + ";};";

    //BUILDING JAVASCRIPT FOR PAGES AND EVENTS
    var onSpecificEventJavascript = '';
    if (eventMarker || pageMarker) {
      onSpecificEventJavascript = "window.optimizely.push({type: 'addListener',filter: {type: 'analytics',name: 'trackEvent',},handler: function(data) {console.log('Page', data.name, 'was activated.');if(data.data.type === 'pageview'){console.log('apiName',data.data.apiName);eval(onPageLoadsObjectFunction()[data.data.apiName]);}else{eval(onEventsObjectFunction()[data.data.apiName]);};}});";
      onSpecificEventJavascript = '$(document).ready(function(){' +onSpecificEventJavascript+ '});';
    }



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
    });
  },
  buildJavascript: function(response) {
    if (!response) {
      response = "{project_javascript: ''}";
    }
    var j = JSON.parse(response).project_javascript;


    //get start section
    originalJavascriptStartSectionIndex = j.indexOf('//--------------------HorizonsJavascriptStart--------------------');
    var originalJavascriptStartSection = '';
    if (originalJavascriptStartSectionIndex !== -1) {
      originalJavascriptStartSection = j.slice(0, originalJavascriptStartSectionIndex);
    }

    //get end section
    originalJavascriptEndSectionIndex = j.indexOf('\n//--------------------HorizonsJavascriptEnd--------------------') + 64;
    var originalJavascriptEndSection = '';
    if (originalJavascriptEndSectionIndex !== -1) {
      originalJavascriptEndSection = j.slice(originalJavascriptEndSectionIndex);
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
       });
  },
  getTagOptions: function(project) {
    this.project = project;
    return Tag.find({'hasCallback': true, 'projectId': this.project.projectId, "active": true});
  },
  getOptions: function(tags) {
    //TODO: uncomment if error
    // if (tags.length === 0) {
    //   this.tagNames = ['inHeader,inHeader', 'onDocumentReady,onDocumentReady'];
    // }
    //get names of options
    this.tagNames = tags.map(function(item) {
      if (item.name === 'custom') {
        return "onTrigger," + item.customId;
      }
      else {
        return "onTrigger," + item.name;
      }
    });


    //inHeader/onDocumentReady should intuitively come first
    this.tagNames.unshift("inHeader,inHeader");
    this.tagNames.unshift("onDocumentReady,onDocumentReady");

    //save current tags
    this.tags = tags;

    //make call to optimizely for all events associated with the id
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
    //saves events
    this.events = events;

    //makes call for all pages associated with project
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
    // console.log("tag.name", tag.name)
    // console.log('[tag in updateTag]', tag)
    // console.log('[masters in updateTag]', this.masters)
    var master = this.masters.filter(function(item) {
      // console.log("ITEM>NAME", item, item.name, "TAG>NAME", tag, tag.name)
      return item.name === tag.name;
    }.bind(this))[0];
    var fields = [];
    for(var i = 0; i < master.tokens.length; i++) {
      fields.push({'name': master.tokens[i]['tokenName'], 'description': master.tokens[i]['description'], 'value': this.body[master.tokens[i]['tokenName']]})
    }
    var newTrackingTrigger = this.body.trackingTrigger.slice(this.body.trackingTrigger.indexOf(',') + 1);
    var newTrackingTriggerType = this.body.trackingTrigger.slice(0, this.body.trackingTrigger.indexOf(','))
    // console.log("HELLOOOO LOOK", this.body.trackingTrigger)
    // console.log("HELLLLOOO LOOK", newTrackingTrigger);
    // console.log("HELLLLOOO LOOK", newTrackingTriggerType);
    // console.log("MEEEEE", tag.trackingTriggerType);
    if (tag.trackingTriggerType === 'onTrigger') {
      // console.log('i got in here', tag.trackingTriggerType)
      this.tagid = tag._id;
      this.addCallbacksBool = true;
      this.oldCallback = tag.trackingTrigger;
    }
    // console.log('nope didnt get in', tag.trackingTriggerType, this.addCallbacksBool)

    tag.fields = fields;
    tag.approved = this.body.approved;
    tag.trackingTrigger = newTrackingTrigger;
    tag.trackingTriggerType = newTrackingTriggerType;
    if (this.body.template) {
      console.log("**************HEY THERES A NEW TEMPLATE******************")
      tag.template = this.body.template;
    }
    tag.projectId = this.body.projectId;
    tag.active = this.body.active;
    console.log("tag.name", tag.name)
    return tag.save();
  },
  chooseCallbackPath: function(tag) {
    //saving the tag to send back to client side at end of chain
    this.tag = tag;

    //if they changed the trigger to be another snippet-- change the
    //callbacks of their current parent (if snippet), change the callbacks of their future
    //parent
    console.log('[stage] inside chooseCallbackPath')
      return new Promise(function(resolve, reject) {
        if(this.addCallbacksBool) {
          console.log('[stage] addCallbacks')
          Tag.find({"projectId": tag.projectId})
             .then(this.removeCallbacks.bind(this))
             .then(this.addCallbacks.bind(this))
             .then(this.getProject.bind(this))
             .then((response)=>resolve(response))
             .catch(err=>reject(err))
        }
        else {
          console.log('[stage] dont add');
          Tag.find({"projectId": tag.projectId})
             .then(this.addCallbacks.bind(this))
             .then(this.getProject.bind(this))
             .then((response)=>resolve(response))
             .catch(err=>reject(err));
        }
      }.bind(this));
  },
  removeCallbacks: function(tags) {
    console.log('[stage] removeCallbacks');
    this.tags = tags;
    console.log("________________THIS.TAG________________", tags);
    console.log("________________THIS.tags________________", tags);
    var myTag = tags.filter(function(item) {
      console.log("ME", item._id.toString(), this.tagid.toString());
      return item._id.toString() === this.tagid.toString();
    }.bind(this))[0];

    var tagWithCallback = tags.filter(function(item) {
      if (myTag.name === "custom") {
        return item.callbacks.map(function(el) {
          return el.slice(0,1);
        }).includes("*");
      }
      else {
        return item.callbacks.includes(myTag.name);
      }
    })[0];

    var temp = myTag.name;
    if (myTag && tagWithCallback) {
      if (myTag.name === 'custom') {
        temp = myTag.customId;
      }
      var index = tagWithCallback.callbacks.indexOf(temp);

      //deleting 1 item at the index
      tagWithCallback.callbacks.splice(index, 1);
      return tagWithCallback.save();
    }
    else {
      return;
    }
  },
  addCallbacks: function(tags) {
    //checking for if tags is an object or an array
    if (tags && tags.hasOwnProperty('length')) {
      this.tags = tags;
    }
    console.log('[stage] addCallbacks function');
    var myTag = this.tags.filter(function(item) {
      return item._id.toString() === this.tagid.toString();
    }.bind(this))[0];
    console.log("MY TAG", myTag)

    var parentTag = this.tags.filter(function(item) {
      if (item.name === "custom") {
        return (item.customId === myTag.trackingTrigger);
      }
      else {
        console.log("[items]", item.name, myTag.trackingTrigger);
        return item.name === myTag.trackingTrigger;
      }
    })[0];
    console.log("[parentTag]", parentTag)

    var temp = myTag.name;
    if (myTag.name === 'custom') {
      temp = myTag.customId;
    }

    if(parentTag) {
      parentTag.callbacks.push(temp);
      return parentTag.save();
    } else {
      return myTag;
    }
  },
  removeTag: function(tag) {
    return Tag.remove({"_id": this.tagid});
  },
  findAllMasters: function() {
    return Master.find({'approved': true});
  },
  setAllMasters: function(masters) {
    this.masters = masters;
    return;
  }
  //TODO: if we do getParents -- we need to account for custom in .name
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
class Utils {
  constructor() {
    return utils;
  }
}
module.exports = Utils;
