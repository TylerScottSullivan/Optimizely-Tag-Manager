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
  addCallbacksBool: false,
  body: null,
  //oldCallback: null,
  project: null,
  tag: null,
  tagid: null,
  token: null,
  addCallbacks: function(tags) {
    //adds tag as a "callback" of the tag it is triggered on
    //if the function is passed an array of tags, set this.tags = tags
    if (tags && tags.hasOwnProperty('length')) {
      this.tags = tags;
    }

    //find specific tag from tag id
    var myTag = this.tags.filter(function(item) {
      return item._id.toString() === this.tagid.toString();
    }.bind(this))[0];
    //find tag to add the callback to
    var parentTag = this.tags.filter(function(item) {
      //trackingTrigger is a customId if the parent tag is a custom tag
      if (item.name === "custom") {
        return (item.customId === myTag.trackingTrigger);
      }
      else {
        return item.name === myTag.trackingTrigger;
      }
    })[0];
    //we don't want to change the actual tag just in case (mongo is weird) so we're using a temp variable
    var temp = myTag.name;
    if (myTag.name === 'custom') {
      temp = myTag.customId;
    }

    // if the parentTag exists, add myTag's name (temp) to it's callback, else return myTag (allows us to get the projectId later in promise chain)
    if(parentTag) {
      parentTag.callbacks.push(temp);
      return parentTag.save();
    } else {
      return myTag;
    }
  },
  addProjectOptions: function(pages) {
    //adds page and event names to the tagNames for /options
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
  buildJavascript: function(response) {
    //builds final Javascript to be used in PUT API call to optimizely servers

    //handles case where project_javascript is empty
    if (!response) {
      response = "{project_javascript: ''}";
    }

    var j = JSON.parse(response).project_javascript;


    //get start section of our code in project_javascript, so we don't wipe what's outside our code in project_javascript
    originalJavascriptStartSectionIndex = j.indexOf('//--------------------HorizonsJavascriptStart--------------------');
    var originalJavascriptStartSection = '';
    if (originalJavascriptStartSectionIndex !== -1) {
      originalJavascriptStartSection = j.slice(0, originalJavascriptStartSectionIndex);
    }

    //get end section of our code in project_javascript
    originalJavascriptEndSectionIndex = j.indexOf('\n//--------------------HorizonsJavascriptEnd--------------------') + 64;
    var originalJavascriptEndSection = '';
    if (originalJavascriptEndSectionIndex !== -1) {
      originalJavascriptEndSection = j.slice(originalJavascriptEndSectionIndex);
    }

    //add our javascript piece (this.combinedJavascript) to the originalJavascriptStartSection and end section
    var finalJavascript = originalJavascriptStartSection + "//--------------------HorizonsJavascriptStart--------------------\n" + this.combinedJavascript + '\n//--------------------HorizonsJavascriptEnd--------------------' + originalJavascriptEndSection;
    var token = process.env.API_TOKEN;

    //PUT request to optimizely, replaces project_javascript of project
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
  chooseCallbackPath: function(tag) {
    //checks to see if tag had a parent tag, removes that callback before proceeding

    //saving the tag to send back to client side at end of chain
    this.tag = tag;

    //new promise chain to account for if/else logic
      return new Promise(function(resolve, reject) {
        if(this.addCallbacksBool) {
          //if tag had parent-- change callbacks of parentTag, addCallback to new parent tag, get Project
          Tag.find({"projectId": tag.projectId})
             .then(this.removeCallbacks.bind(this))
             .then(this.addCallbacks.bind(this))
             .then(this.getProject.bind(this))
             .then((response)=>resolve(response))
             .catch(err=>reject(err))
        }
        else {
          //else addCallback to new parent tag, get project
          Tag.find({"projectId": tag.projectId})
             .then(this.addCallbacks.bind(this))
             .then(this.getProject.bind(this))
             .then((response)=>resolve(response))
             .catch(err=>reject(err));
        }
      }.bind(this));
  },
  createTag: function(tag) {
    //creates a new tag

    /*only creates a new tag if the tag does not already exist -- custom tags
    are special because they are id'd by their customId*/
    if (!tag || tag.name === "custom") {
      var fields = [];

      //finds correct master template for this tag
      var master = this.masters.filter(function(item) {
        return item.name === this.body.name;
      }.bind(this))[0];

      //pushes appropriate tokens to the fields array of the tag, as determined by master template
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

      //req.body.trackingTrigger is recieved from front end as [trackingTrigger],[trackingTriggerType]
      var trackingTrigger = this.body.trackingTrigger.slice(this.body.trackingTrigger.indexOf(',') + 1);
      var trackingTriggerType = this.body.trackingTrigger.slice(0, this.body.trackingTrigger.indexOf(','));
      displayName = this.body.displayName || master.displayName;

      //creates the new tag
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

      //saves the new tag
      return t.save();
    }
    else {
      //throws error if you try to create a tag twice
      throw "Cannot create a tag twice";
    }
  },
  findMasters: function() {
    //gets all available master templates
    return Master.find({'approved': true});
  },

  findTagSetMasters: function(masters) {
    //sets passed in masters to this.masters
    this.masters = masters;

    //finds all tags with this.body.name and the current project
    return Tag.findOne({"name": this.body.name, "projectId": this.project.projectId});
  },
  getChildren: function(tags, startingTag, list) {
    //getting the children of a tag to rule them out of being a trigger
    //for /options route

    var children = tags.filter(function(item) {
        return startingTag.callbacks.includes(item.name);
      // }
    })
    for(var i = 0; i < children.length; i++) {
      list.concat(this.getChildren(tags, children[i], list));
    }

    list.push(startingTag.name);
    return list;
  },
  getJavascript: function(populatedProject) {
    //sets the this.combinedJavascript field to be used later in buildJavascript in PUT call to project_javascript

    this.project = populatedProject;
    var tags = this.project.tags;

    //gets all tags that are enabled
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
    var inHeaderJavascript = '';
    for(var i = 0; i < inHeaders.length; i++) {
      //call render for each inHeader
      inHeaderJavascript += inHeaders[i].render(tags, this.masters);
    }
    //BUILDING ONDOCUMENTREADY JAVASCRIPT
    var onDocumentReadyJavascript = '';
    for(var i = 0; i < onDocumentReadys.length; i++) {
      onDocumentReadyJavascript += onDocumentReadys[i].render(tags, this.masters);
    }
    //wrap onDocumentReadyJavascript in document.ready
    onDocumentReadyJavascript = '$(document).ready(function(){' +onDocumentReadyJavascript+ '});';

    //BUILDING ON EVENT OBJECT
    //events are triggered by a listener we place in project_javascript--gets desired code for event by calling onEventsObject[event name]
    var onEventsObject = {};
    var eventMarker = false;
    for(var i = 0; i < onEvents.length; i++) {
      eventMarker = true;
      onEventsObject[onEvents[i].trackingTrigger] = onEvents[i].render(tags, this.masters);
    }

    //stringify object and make it a function to be called to get the object later
    onEventsObjectString = JSON.stringify(onEventsObject);
    onEventsObjectString = "var onEventsObjectFunction = function() {return " + onEventsObjectString + ";};";

    //BUILDING ON PAGE OBJECT
    //pages are triggered by a listener we place in project_javascript--gets desired code for page by calling onEventsObject[page name]
    var onPageLoadObject = {};
    var pageMarker = false;
    for(var i = 0; i < onPageLoads.length; i++) {
      pageMarker = true;
      onPageLoadObject[onPageLoads[i].trackingTrigger] = onPageLoads[i].render(tags, this.masters);
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

    //getting original Javascript sections through call to Optimizely api
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
  getOptions: function(tags) {
    //sets this.tag names to all possible tag names formatted properly i.e. onTrigger,[name or customId]
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
    var token = this.body.token;
    console.log("HAYYYYYY LOOOOOOK", token)
    return rp({
         uri: "https://www.optimizelyapis.com/v2/events?project_id=" + this.body.projectId,
         method: 'GET',
         headers: {
           "Authorization": "Bearer " + token,
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
    var token = this.body.token;
    console.log("HAYYYYYY LOOOOOOK", token)
    return rp({
         url: "https://www.optimizelyapis.com/v2/pages?project_id=" + this.body.projectId,
         method: 'GET',
         headers: {
           "Authorization": "Bearer " + token,
           "Content-Type": "application/json"
         }
       })
  },
  getProject: function(projectId, tagid) {
    if (tagid) {
      this.tagid = tagid;
    }
    //this function can be passed either a projectId or a tag, so this checks for which it is
    //and sets variables accordingly
    if(projectId.projectId) {
      projectId = projectId.projectId
    }
    return Project.findOne({'projectId': projectId})
  },
  getTagOptions: function(project) {
    //gets all tags that are callback-able, part of this project, and enabled
    this.project = project;
    return Tag.find({'projectId': this.project.projectId});
  },
  populateProject: function(updatedProject) {
    return updatedProject.populate({path: 'tags'}).execPopulate();
  },
  removeCallbacks: function(tags) {
    this.tags = tags;

    //finds correct tag matching by tag id
    var myTag = tags.filter(function(item) {
      return item._id.toString() === this.tagid.toString();
    }.bind(this))[0];

    //finds the tag that contains the to-be-deleted tag as a callback
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

    //mongo is weird so we have to create a temporary variable to not change the actual tag
    //but still account for custom tags
    var temp = myTag.name;
    if (myTag && tagWithCallback) {
      if (myTag.name === 'custom') {
        temp = myTag.customId;
      }
      var index = tagWithCallback.callbacks.indexOf(temp);

      //splicing tag from the tagWithCallback callbacks
      tagWithCallback.callbacks.splice(index, 1);
      return tagWithCallback.save();
    }
    else {
      return;
    }
  },
  removeTag: function(tag) {
    //removes tag from mongo
    return Tag.remove({"_id": this.tagid});
  },
  removeTagFromProject: function(project) {
    //removes tag from project
    project.tags.splice(project.tags.indexOf(this.tagid), 1);
    return project.save();
  },
  restrictOptions: function(tags) {
      // takes in all tags and this.tagid is set to the starting tag we are trying to update
      //if we are adding a tag for the first time, it will not have any children, and will not have to go
      //through any additional steps
      if (this.tagid === 'undefined' || !this.tagid) {
        return tags.filter(function(item) {
          return item.name !== "custom";
        });
      }

      var startingTag = tags.filter((item) => {
        return item._id.toString() === this.tagid.toString();
      })[0];
      var noGos = this.getChildren(tags, startingTag, []);

      var availableTagTriggers = tags.filter(function(item) {
          return item.active && item.hasCallback && !(noGos.includes(item.name)) && item.name !== "custom";
      });
      return availableTagTriggers;
  },
  setMasters: function(masters) {
    this.masters = masters;
    return;
  },
  setMasterFindTagByID: function(masters) {
    //set the master and find the correct tag
    this.masters = masters;
    return Tag.findById(this.tagid)
  },
  setProjectFindMasters: function(project) {
    //sets the project and finds all approved master templates
    this.project = project;
    return Master.find({"approved": true});
  },
  updateTag: function(tag) {
    //updates a tag in mongo

    //finds the corresponding master tag to the tag-to-be-updated
    var master = this.masters.filter(function(item) {
      return item.name === tag.name;
    }.bind(this))[0];

    //pushes correct input to the fields property of the tag based off of
    //master template
    var fields = [];
    for(var i = 0; i < master.tokens.length; i++) {
      fields.push({'name': master.tokens[i]['tokenName'], 'description': master.tokens[i]['description'], 'value': this.body[master.tokens[i]['tokenName']]})
    }

    //trigger for the tag comes in a form [trigger type], [trigger name]
    var newTrackingTrigger = this.body.trackingTrigger.slice(this.body.trackingTrigger.indexOf(',') + 1);
    var newTrackingTriggerType = this.body.trackingTrigger.slice(0, this.body.trackingTrigger.indexOf(','));
    if (tag.trackingTriggerType === 'onTrigger') {
      this.tagid = tag._id;
      this.addCallbacksBool = true;
    }

    tag.fields = fields;
    tag.approved = this.body.approved;
    tag.trackingTrigger = newTrackingTrigger;
    tag.trackingTriggerType = newTrackingTriggerType;
    if (this.body.template) {
      tag.template = this.body.template;
    }
    tag.projectId = this.body.projectId;
    tag.active = this.body.active;
    return tag.save();
  },
  updateProject: function(tag) {
    //updates the tags of a project and saves the project
    //also updates the tag which the new tag is called on to include it in callbacks
    this.tag = tag;
    this.project.tags.push(tag._id);
    return new Promise(function(resolve, reject) {
      //check if need to add callbacks to any tags
      if(tag.trackingTriggerType === "onTrigger") {
        Tag.findOne({"name": tag.trackingTrigger, "projectId": this.project.projectId})
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
  }
}
class Utils {
  constructor() {
    return utils;
  }
}
module.exports = Utils;
