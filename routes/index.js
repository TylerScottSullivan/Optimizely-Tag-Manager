var express = require('express');
var router = express.Router();
var canvasSdk = require('optimizely-canvas-sdk');
var Project = require('../models/models');
var request = require('request');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/', function(req, res, next) {
  // console.log('req', JSON.stringify(req))
  // var data = req.query.data
  var signedRequest = req.query.signed_request
  console.log(signedRequest)
  console.log(process.env.SECRET)
  var userContext = canvasSdk.extractUserContext(process.env.SECRET, signedRequest);
  var project = new Project({
      projectId: userContext.context.environment.current_project,
      accountId: userContext.context.environment.current_account,
      color: req.body.color
    })
    project.save(function(err) {
      if (err) next(err)
      res.send("<3 thx optimizely")
    })
});

router.get('/project/:id', (req, res, next) => {
  Project.find(req.params.id, function(err, project) {
    console.log('err', err)
    if (err) {
      next(err)
    } else {
      console.log("token", process.env.API_TOKEN)
      var token = process.env.API_TOKEN;
      request({
           url: "https://www.optimizelyapis.com/experiment/v1/projects/" + req.params.id,
           method: 'PUT',
           json: {
             include_jquery: true,
             project_javascript: "var thisThing = function() { console.log('color:', project.color) }; thisThing()"
           },
           headers: {
             "Token": token,
             "Content-Type": "application/json"
           }
         }, function(error, response) {
          //  console.log("send error", error)
          //  console.log("send resp", response)
           console.log("send resp", response.body)
           if (error) {
               console.log('Error sending messages: ', error)
           } else {
             next(response)
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
