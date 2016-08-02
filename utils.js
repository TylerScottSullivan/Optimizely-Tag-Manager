var express = require('express');
var router = express.Router();
var canvasSdk = require('optimizely-canvas-sdk');
var Project = require('../models/models').Project;
var Master = require('../models/models').Master;
var Tag = require('../models/models').Tag;
var request = require('request-promise');
var snippets = require('../snippets')
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
      fields.push({'name': master.tokens[i]['tokenName'], 'description': master.tokens[i]['description'], 'value': this.body[master.tokens[i]['tokenName']]})
    }
    t = new Tag({
      name: this.body.type,
      fields: fields,
      approved: true,
      tagDescription: master.tagDescription,
      trackingTrigger: this.body.trackingTrigger,
      custom: this.body.custom,
      rank: this.body.rank,
      projectId: this.project.projectId,
      active: this.body.active,
      hasCallback: master.hasCallback
    })
    return t.save()
  },
  updateProject: function(tag) {
    this.project.tags.push(tag._id);
    return new Promise(function(resolve, reject) {
      if(tag.trackingTrigger !== "onDocumentReady" && tag.trackingTrigger !== "inHeader") {
        Tag.findOne({"name": tag.trackingTrigger})
           .then(function(trackerTag) {
              trackerTag.callbacks.push(tag.name)
              return trackerTag.save()
            }.bind(this))
           .then(()=>resolve(project.save()))
           .catch(err=>reject(err))
      else {
        resolve(project.save())
        }
      })
    }
  },
  populateProject: function(updatedProject) {
    return updatedProject.populate('tags')
  },
  getJavascript: function(populatedProject) {
    var inHeaders = tags.filter(function(item){
                    return item.trackingTrigger === "inHeader";
                  })
    var onDocumentReadys = tags.filter(function(item){
                              return item.trackingTrigger === "onDocumentReady";
                            })

    var inHeaderJavascript = '';
    for(var i = 0; i < inHeaders.length; i++) {
      //call render for each inHeader
      inHeaderJavascript += inHeaders[i].render();
    }
    var onDocumentReadyJavascript = '';
    for(var i = 0; i < onDocumentReadys; i++) {
      //TODO: wrap this in onDocumentReady here, not in function
      onDocumentReadyJavascript += onDocumentReadys[i].render();
    }

    //wrap onDocumentReadyJavascript in an on document ready
    onDocumentReadyJavascript = '$(document).ready(function(){' +onDocumentReadyJavascript+ '})'

    //combine inHeaders and onDocumentReadys
    var combinedJavascript = inHeaders + onDocumentReadys;

    //getting original Javascript sections
    var token = process.env.API_TOKEN;

    return request({
                     url: "https://www.optimizelyapis.com/experiment/v1/projects/" + project.projectId,
                     method: 'GET',
                     json: {
                       include_jquery: true,
                       project_javascript: javascript},
                     headers: {
                       "Token": token,
                       "Content-Type": "application/json"
                     }
     })
  },
  buildJavascript: function(response) {
    var j = response.responseText.project_javascript;

    //get start section
    originalJavascriptStartSectionIndex = j.indexOf('//--------------------HorizonsJavascriptStart--------------------');
    var originalJavascriptStartSection = j.slice(0, originalJavascriptStartSectionIndex);

    //add our javascript piece to the originalJavascriptStartSection
    var finalJavascript = originalJavascriptStartSection + "//--------------------HorizonsJavascriptStart--------------------\n" + combinedJavascript + "//--------------------HorizonsJavascriptEnd--------------------\n";

    return request({
         url: "https://www.optimizelyapis.com/experiment/v1/projects/" + project.projectId,
         method: 'PUT',
         json: {
           include_jquery: true,
           project_javascript: javascript},
         headers: {
           "Token": token,
           "Content-Type": "application/json"
         }
       })
  }
}
