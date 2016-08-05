var express = require('express');
var router = express.Router();
var canvasSdk = require('optimizely-canvas-sdk');
var Project = require('./models/models').Project;
var Master = require('./models/models').Master;
var Tag = require('./models/models').Tag;
var rp = require('request-promise');
var snippets = require('./snippets')
var findOrCreate = require('mongoose-findorcreate')

module.exports = {
  body: null,
  project: null,
  findMaster: function(project) {
    this.project = project;
    return Master.findOne({"name": this.body.type})
  },
  createTag: function(master) {
    var fields = [];
    for(var i = 0; i < master.tokens.length; i++) {
      console.log("WOOOOOOOO THESE ARE MY MASTER TOKENS", master.tokens[i], i)
      fields.push({'name': master.tokens[i]['tokenName'], 'description': master.tokens[i]['description'], 'value': this.body[master.tokens[i]['tokenName']]})
      console.log("HAYYYYYYYY THESE ARE MY FIELDS", fields, i)
    }
    t = new Tag({
      name: master.name,
      fields: fields,
      approved: true,
      tagDescription: master.tagDescription,
      trackingTrigger: this.body.trackingTrigger,
      custom: this.body.custom,
      projectId: this.project.projectId,
      active: this.body.active,
      hasCallback: master.hasCallback,
      pageName: this.body.pageName
    })
    return t.save()
  },
  updateProject: function(tag) {
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
    return updatedProject.populate({path: 'tags'}).execPopulate()
  },
  getJavascript: function(populatedProject) {
    var tags = this.project.tags;

//do everything separately

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
      inHeaderJavascript += inHeaders[i].render(tags);
    }
    var onDocumentReadyJavascript = '';
    for(var i = 0; i < onDocumentReadys.length; i++) {
      //TODO: wrap this in onDocumentReady here, not in function
      onDocumentReadyJavascript += onDocumentReadys[i].render(tags);
    }

    //object of pages to ids
    var pagesToIds = {'homepage': "6777018235", "appspot_page": "6824721001"}



    //get all pages call
    var onPageLoadsObject = {};
    var marker = false;
    for(var i = 0; i < onPageLoads.length; i++) {
      marker = true;
      onPageLoadsObject[pagesToIds[onPageLoads[i].pageName]] = onPageLoads[i].render(tags);
    }

    onPageLoadsObjectString = JSON.stringify(onPageLoadsObject);
    onPageLoadsObjectString = "var onPageLoadsObjectFunction = function() {return " + onPageLoadsObjectString + ";};"

    //
    // 'var x = function() {return {"8498593828"": ga(I am adobe(hello)), "29ry38473985938": segment(made up thing)}}'
    //
    // x()[data.id]

    var onSpecificPageLoadJavascript = '';
    if (marker) {
      onSpecificPageLoadJavascript = "window.optimizely.push({type: 'addListener',filter: {type: 'lifecycle',name: 'viewActivated',},handler: function(data) {console.log('Page', data.name, 'was activated.');onPageLoadsObjectFunction()[data.id]();}});"
    }
    console.log("THIS.inHeaderJavascript", inHeaderJavascript)
    //wrap onDocumentReadyJavascript in an on document ready
    onDocumentReadyJavascript = '$(document).ready(function(){' +onDocumentReadyJavascript+ '});'
    console.log("THIS.onDocumentReadyJavascript", onDocumentReadyJavascript)

    //combine inHeaders and onDocumentReadys
    this.combinedJavascript = onPageLoadsObjectString + inHeaderJavascript + onDocumentReadyJavascript + onSpecificPageLoadJavascript;
    console.log("THIS.COMBINEDJAVASCRIPT", this.combinedJavascript)

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

    //add our javascript piece to the originalJavascriptStartSection
    var finalJavascript = originalJavascriptStartSection + "//--------------------HorizonsJavascriptStart--------------------\n" + this.combinedJavascript;
    var token = process.env.API_TOKEN;
    console.log("Javascript", finalJavascript)
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
    return Tag.find({'hasCallback': true});
  },
  getOptions: function(tags) {
        //get names of options
        tags.map(function(item) {
          return item.name;
        });

        //inHeader/onDocumentReady should intuitively come first
        tags.unshift("inHeader");
        tags.unshift("onDocumentReady");

        //save current tags
        this.tags = tags;

        //make call to optimizely for all pages associated with the id
        var token = process.env.API_TOKEN;
        return rp({
             uri: "https://www.optimizelyapis.com/v2/events?project_id=" + this.project.projectId,
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
    return data;
  }
}
