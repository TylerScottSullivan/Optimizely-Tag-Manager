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
  // console.log(signedRequest)
  // console.log(process.env.SECRET)
  var userContext = canvasSdk.extractUserContext(process.env.SECRET, signedRequest);
  console.log('req.body.trackingTri', req.body.trackingTrigger)
  var project = new Project({
      projectId: userContext.context.environment.current_project,
      accountId: userContext.context.environment.current_account,
      trackingID: req.body.trackingID,
      trackingTrigger: req.body.trackingTrigger
    })
    project.save(function(err) {
      if (err) next(err)
      res.send("<3 thx optimizely")
    })
});

router.get('/project/:id', (req, res, next) => {
  //find or create
  Project.findOne({'projectId': req.params.id}, function(err, project) {
    if (err) {
      next(err)
    } else {
      var javascript = '';

      if (project.trackingTrigger === 'onPageLoad') {
        javascript = "$(document).ready(function(){(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){ \
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),\
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)\
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');\
ga('create', '"+ project.trackingID + "', 'auto');\
ga('send', 'pageview')});\
console.log('I just loaded GA');"
      } else if (project.trackingTrigger === 'inHeader') {
        javascript = "(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){ \
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),\
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)\
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');\
ga('create', '"+ project.trackingID + "', 'auto');\
ga('send', 'pageview');"
      } else {
        console.log('you got an err')
      }
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
          //  console.log("send error", error)
          //  console.log("send resp", response)
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
