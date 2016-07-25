var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET redirect page. */
router.get('/redirect', function(req, res, next) {
  
  res.render('redirect', { title: 'REDIRECT SUCCESS' });
});





module.exports = router;
