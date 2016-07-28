var express = require('express');
var router = express.Router();
var canvasSdk = require('optimizely-canvas-sdk');
var Project = require('../models/models');
var request = require('request');
var snippets = require('../snippets')
var findOrCreate = require('mongoose-findorcreate')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/', function(req, res, next) {
  // console.log('req', JSON.stringify(req))
  // var data = req.query.data
  var signedRequest = req.query.signed_request
  // console.log(signedRequest)
  // console.log(process.env.SECRET)
  var userContext = canvasSdk.extractUserContext(process.env.SECRET, signedRequest);
  console.log('req.body.trackingTri', req.body.custom)
                    //Check if a project already exists
  //YES                                                             //NO
  //make new tag                                                    //create project
  //append new tag id to tags of found project                      //create new tag
                                                                    //append new tag id to tags of created project
  Project.findOrCreate({'projectId': userContext.context.environment.current_project},
                       {'accountId': userContext.context.environment.current_account,
                       'tags': [],
                       'projectId': userContext.context.environment.current_project},
                        function(err, project) {
                          if (err) {
                            console.log('Error at line 32 of index.js finding project', err)
                          }
                          else {
                            t = new Tag({
                              name: req.body.tag,
                              trackingId: req.body.trackingID,
                              trackingTrigger: req.body.trackingTrigger,
                              custom: req.body.custom,
                              rank: req.body.rank, //add this
                              projectId: project.projectId,
                              active: req.body.active //add this
                            })
                          }
                        }
)




  // Project.find({'projectId': userContext.context.environment.current_project}, function(err, project) {
  //   if (project) {
  //
  //   }
  // })
  //
  // Project.findOrCreate({'projectId': userContext.context.environment.current_project},
  //                     {'accountId': userContext.context.environment.current_account,
  //                      'trackingId': req.body.trackingID,
  //                      'trackingTrigger': req.body.trackingTrigger,
  //                      'tag': req.body.tag,
  //                      'custom': req.body.custom},
  //                      function(err, project, created) {
  //                        if (err) {
  //                          console.log(err);
  //                        }
  //                        else {
  //                          if (created) {
  //                            res.send("<3 thx optimizely, I made an object")
  //                          }
  //                          else {
  //                            res.send("<3 thx optimizely, but I didn't make an object")
  //                          }
  //                        }
  //                      });
});

router.get('/project/:id', (req, res, next) => {
  //find or create
  Project.findOne({'projectId': req.params.id}, function(err, project, created) {
    if (err) {
      next(err)
    } else {
      if(snippets[project.tag]) {
        var javascript = snippets[project.tag](project.trackingID, project.trackingTrigger === 'onPageLoad')
      }
      else {
        var javascript = project.custom
      }
      console.log('THIS IS YOUR JAVASCRIPT', javascript);
      console.log('THIS IS YOUR CUSTOM', project.custom);
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
           console.log("send resp", response.body)
           if (error) {
               console.log('Error sending messages: ', error)
           } else {
             res.status(200).send('I am alright')
           }
       })
    }
  })
})

/* GET redirect page. */
router.get('/redirect', function(req, res, next) {
  res.render('redirect', { title: 'REDIRECT SUCCESS' });
});





module.exports = router;
