var express = require('express');
var router = express.Router();
var canvasSdk = require('optimizely-canvas-sdk');
var Project = require('../models/models').Project;
var Master = require('../models/models').Master;
var Tag = require('../models/models').Tag;
var request = require('request');
var snippets = require('../snippets')
var findOrCreate = require('mongoose-findorcreate')

//TODO this is going to need to be promised
// var fieldBuilder = function(data) {
//   Master.findOne({_id: '[INSERTID]'}, function(err, master) {
//     //assuming data.type exists for all tags
//     var toReturn = [];
//     for(var i = 0; i < master[data.type].length; i++) {
//       toReturn.push({'name': master[data.type][i], 'value': data[master[data.type][i]]})
//     }
//     return toReturn;
//   })
// }
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/request', function(req, res, next) {
  res.render('request')
});

router.post('/request', function(req, res, next) {
  var fields = {"name": req.body.fieldName, 'description': req.body.fieldDescription}
  var t = new Tag({
    name: req.body.type,
    tagDescription: req.body.tagDescription,
    fields: fields,
    approved: false,
    custom: req.body.snippet
  })
  t.save(function(err, tag) {
    if (err) {
      console.log("Error in index.js line 42 saving snippet tag", err)
    }
    else {
      res.status(200).send("Okay with saving the tag")
    }
  })
})

router.post('/', function(req, res, next) {

  //getting the signedRequest from Optimizely
  var signedRequest = req.query.signed_request;

  //decoding the signedRequest using the secret
  var userContext = canvasSdk.extractUserContext(process.env.SECRET, signedRequest);

  //either find or create a new project object, to which we will append a new tag w/appropriate fields
  Project.findOrCreate({'projectId': userContext.context.environment.current_project},
                       {'accountId': userContext.context.environment.current_account,
                       'tags': [],
                       'projectId': userContext.context.environment.current_project},
                        function(err, project) {
                          if (err) {
                            console.log('Error at line 65 of index.js finding project', err)
                          }
                          else {
                            Master.findOne({name: req.body.type}, function(err, master) {
                              //assuming data.type exists for all tags
                              var fields = [];
                              for(var i = 0; i < master.tokens.length; i++) {
                                fields.push({'name': master.tokens[i]['tokenName'], 'description': master.tokens[i]['description'], 'value': req.body[master.tokens[i]['tokenName']]})
                              }
                              t = new Tag({
                                name: req.body.type,
                                fields: fields,
                                approved: true,
                                tagDescription: master.tagDescription,
                                trackingTrigger: req.body.trackingTrigger,
                                custom: req.body.custom,
                                rank: req.body.rank,
                                projectId: project.projectId,
                                active: req.body.active
                              }).save(function(err, tag) {
                                if (err) {
                                  console.log("Error saving tag", err)
                                }
                                else {
                                  project.tags.push(tag._id);
                                  project.save(function(err, updatedProject) {
                                    if (err) {
                                      console.log("Error saving updated project", err)
                                      res.send('Error')
                                    }
                                    else {
                                      updatedProject.populate('tags', function(err, populatedProject) {
                                        if (err) {
                                          console.log("Error populating project", err)
                                        }
                                        else {
                                          //sort tags array by value
                                          project.tags.sort(function(a, b) {
                                            return a.rank-b.rank
                                          })

                                          //make a string of optimizely javascript and add tags in order

                                          var javascript = '';
                                          for(var i = 0; i < project.tags.length; i++) {
                                            if(snippets[project.tags[i]['name']]) {
                                              javascript += snippets[project.tags[i]['name']](project.tags[i]['fields'], project.trackingTrigger === 'onPageLoad')
                                            }
                                            else {
                                              javascript += project.tags[i].custom
                                            }
                                          }
                                          //making the request to insert code into optimizely site
                                          var token = process.env.API_TOKEN;
                                          request({
                                               url: "https://www.optimizelyapis.com/experiment/v1/projects/" + project.projectId,
                                               method: 'PUT',
                                               json: {
                                                 include_jquery: true,
                                                 project_javascript: javascript},
                                               headers: {
                                                 "Token": token,
                                                 "Content-Type": "application/json"
                                               }
                                             }, function(error, response) {
                                               if (error) {
                                               } else {
                                                 res.status(200).send('I am alright')
                                               }
                                           })
                                        }
                                      })
                                    }
                                  })
                                }
                              })
                            })

                          }
                        }
)

});

// router.get('/project/:id', (req, res, next) => {
//   //find all tags for a project
//   //compile the project_javascript
//   //make the request
//
//   Project.findOne({'projectId': req.params.id})
//          .populate('tags')
//          .exec(function(err, project) {
//           if (err) {
//             next(err)
//           } else {
//
//             //sort tags array by value
//             project.tags.sort(function(a, b) {
//               return a.rank-b.rank
//             })
//
//             //make a string of optimizely javascript and add tags in order
//             var javascript = '';
//             for(var i = 0; i < project.tags.length; i++) {
//               if(snippets[project.tags[i]['name']]) {
//                 javascript += snippets[project.tags[i]['name']](project.tags[i]['fields'], project.trackingTrigger === 'onPageLoad')
//               }
//               else {
//                 javascript += project.tags[i].custom
//               }
//             }
//
//             //making the request to insert code into optimizely site
//             var token = process.env.API_TOKEN;
//             request({
//                  url: "https://www.optimizelyapis.com/experiment/v1/projects/" + req.params.id,
//                  method: 'PUT',
//                  json: {
//                    include_jquery: true,
//                    project_javascript: javascript},
//                  headers: {
//                    "Token": token,
//                    "Content-Type": "application/json"
//                  }
//                }, function(error, response) {
//                  if (error) {
//                  } else {
//                    res.status(200).send('I am alright')
//                  }
//              })
//           }
//   })
// })

/* GET redirect page. */
router.get('/redirect', function(req, res, next) {
  res.render('redirect', { title: 'REDIRECT SUCCESS' });
});





module.exports = router;
