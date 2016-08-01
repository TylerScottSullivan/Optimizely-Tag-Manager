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
  t.save(function(err) {
    if (err) console.log(err)
  })
})

router.post('/addtag/:projectid', function(req, res, next) {

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
                            console.log('Error at line 32 of index.js finding project', err)
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
                                  console.log("Error at line 46 saving tag", err)
                                }
                                else {
                                  project.tags.push(tag._id);
                                  project.save(function(err, updatedProject) {
                                    if (err) {
                                      console.log("Error at line 75 of index.js saving updated project", err)
                                      res.send('Error')
                                    }
                                    else {
                                      console.log('Successfully updated project')
                                      res.send('<3 thx optimizely')
                                    }
                                  })
                                }
                              })
                            })

                          }
                        }
)

});

router.get('/project/:id', (req, res, next) => {
  //find all tags for a project
  //compile the project_javascript
  //make the request

  Project.findOne({'projectId': req.params.id})
         .populate('tags')
         .exec(function(err, project) {
          if (err) {
            next(err)
          } else {

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
                 url: "https://www.optimizelyapis.com/experiment/v1/projects/" + req.params.id,
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
})

// /masters
// GET: gets all current master templates
router.get('/master', (req, res, next) => {
  Master.find(function(err, masters) {
    if (err) {
      console.log("err found in finding masters", err)
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(masters)); //send an array of masters
    }
  })
})

// /download/:projectid
// GET: gets all current tags, find project by project id, return all tags from a current project
router.get('/download/:projectid', (req, res, next) => {
  Tag.find({'projectId': req.params.projectid}, function(err, tags) {
    if (err) {
      console.log('err finding tags in download/:projectid', err)
    } else {
      console.log(tags)
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(tags)); //send an array of masters
    }
  })
})

// /updatetag/:projectid/:tagid
// Post: updated information for tag
router.post('/updatetag/:tagid', (req, res, next) => {
  Tag.findById(req.params.tagid, function(err, tag) {
    if (err) {
      console.log('err updating tags', err)
    } else {
      tag.name = req.body.name;
      tag.fields = req.body.fields;
      tag.approved = req.body.approved;
      tag.tagDescription = req.body.tagDescription;
      tag.trackingTrigger = req.body.trackingTrigger;
      tag.custom = req.body.custom;
      tag.rank = req.body.rank;
      tag.projectId = req.body.projectId;
      tag.active = req.body.active;
      tag.save(function(err, t) {
        if (err) {
          console.log("err saving tag in update", err)
        } else {
          res.send("update success", t)
        }
      })
    }
  })
})






module.exports = router;
