var express = require('express');
var router = express.Router();
var canvasSdk = require('optimizely-canvas-sdk');
var Project = require('../models/models');
var request = require('request');
var snippets = require('../snippets')
var findOneOrCreate = require('mongoose-find-one-or-create')

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
  console.log('req.body.trackingTri', req.body.trackingTrigger)
  var project = new Project({
      projectId: userContext.context.environment.current_project,
      accountId: userContext.context.environment.current_account,
      trackingID: req.body.trackingID,
      trackingTrigger: req.body.trackingTrigger,
      tag: req.body.tag
    })
    project.save(function(err) {
      if (err) next(err)
      res.send("<3 thx optimizely")
    })
});

router.get('/project/:id', (req, res, next) => {
  //find or create
  Project.findOneOrCreate({'projectId': req.params.id}, {}, function(err, project) {
    if (err) {
      next(err)
    } else {
      var javascript = snippets[project.tag](project.trackingID, project.trackingTrigger === 'onPageLoad')
      console.log("THIS IS THE JAVASCRIPT", javascript)
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
