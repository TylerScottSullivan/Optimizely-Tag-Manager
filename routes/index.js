var express = require('express');
var router = express.Router();
var canvasSdk = require('optimizely-canvas-sdk');

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('req', req)
  var signedRequest = req.query.signed_request
  try() {
    var userContext = canvasSdk.extractUserContext(process.env.SECRET, signedRequest);
  } except() {
    res.status(401).send('error', error)
  }
  res.render('index', { title: 'Express' });
});

router.post('/', function(req, res, next) {
  var color = req.body.color
  user.save()
  res.render('index', { title: 'Express' });
});

/* GET redirect page. */
router.get('/redirect', function(req, res, next) {
  res.render('redirect', { title: 'REDIRECT SUCCESS' });
});





module.exports = router;
