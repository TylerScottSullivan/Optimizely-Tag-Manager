var express = require('express');
var router = express.Router();
var canvasSdk = require('optimizely-canvas-sdk');
var Project = require('../models/models').projectSchema;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/', function(req, res, next) {
  console.log('req', req)
  var data = JSON.parse(req.query.data)
  var signedRequest = req.query.signed_request
  var userContext = canvasSdk.extractUserContext(process.env.SECRET, signedRequest);
  var project = new Project({
      projectId: userContext.environment.current_project,
      accountId: userContext.environment.current_account,
      color: req.body.color
    })
    project.save(function(err) {
      if (err) next(err)
    })
});

/* GET redirect page. */
router.get('/redirect', function(req, res, next) {
  res.render('redirect', { title: 'REDIRECT SUCCESS' });
});





module.exports = router;
