var express = require('express');
var router = express.Router();
var canvasSdk = require('optimizely-canvas-sdk');
var Project = require('../models/models').Project;
var Master = require('../models/models').Master;
var Tag = require('../models/models').Tag;
var request = require('request-promise');
var snippets = require('../snippets');
var findOrCreate = require('mongoose-findorcreate');
var Utils = require('../utils');

router.use(function(req, res, next) {
  //getting the signedRequest from Optimizely
  var signedRequest = req.query.signed_request;

  //decoding the signedRequest using the secret
  var userContext = canvasSdk.extractUserContext(process.env.SECRET, signedRequest);

  //setting req.optimizely up for future use
  req.optimizely = userContext.context.environment;
  next();
});
/* GET home page. */
router.get('/', function(req, res, next) {
  Project.findOrCreate({'projectId': req.optimizely.current_project},
                       {'accountId': req.optimizely.current_account,
                       'tags': [],
                       'projectId': req.optimizely.current_project})
          .then(function(response) {
            res.render('index');
          })
          .catch(function(err) {
            console.log("err in line 33 of index.js", err);
            next(err);
          });
});

router.get('/request', function(req, res, next) {
  res.render('request');
});

router.post('/request', function(req, res, next) {
  var fields = {"name": req.body.fieldName, 'description': req.body.fieldDescription};
  var t = new Tag({
    name: req.body.type,
    tagDescription: req.body.tagDescription,
    fields: fields,
    custom: req.body.snippet
  });
  t.save(function(err, tag) {
    if (err) {
      console.log("Error in index.js line 42 saving snippet tag", err)
    }
    else {
      res.status(200).send("Okay with saving the tag")
    }
  })
})

//add
router.post('/', function(req, res, next) {
  //either find or create a new project object, to which we will append a new tag w/appropriate fields
  var utils = new Utils();
  utils.body = req.body;
  Project.findOne({'projectId': req.optimizely.current_project})
        .then(utils.findMaster.bind(utils))
        .then(utils.findTagSetMasters.bind(utils))
        .then(utils.createTag.bind(utils))
        .then(utils.updateProject.bind(utils))
        .then(utils.populateProject.bind(utils))
        .then(utils.getJavascript.bind(utils))
        .then(utils.buildJavascript.bind(utils))
        .then(function(response) {
          res.status(200).json(utils.tag)
        })
        .catch(function(err) {
          console.log("Error at the end of /", err)
          next(err);
        })
});

router.post('/deletetag/:tagid', function(req, res, next) {
  var utils = new Utils();
  utils.tagid = req.params.tagid;
  console.log("WOOOOOOOW", utils.tagid);
  Tag.find({"projectId": req.optimizely.current_project})
     .then(utils.removeCallbacks.bind(utils))
     .then(utils.removeTag.bind(utils))
     .then(utils.findAllMasters.bind(utils))
     .then(utils.setAllMasters.bind(utils))
     .then(utils.getProject.bind(utils, req.optimizely.current_project, req.params.tagid))
     .then(utils.removeTagFromProject.bind(utils))
     .then(utils.populateProject.bind(utils))
     .then(utils.getJavascript.bind(utils))
     .then(utils.buildJavascript.bind(utils))
     .then(function(response) {
       console.log("GOT TO THE END OF THE DELTE CHAIN")
       res.status(200).send('I am alright')
     })
     .catch(function(err) {
       console.log("Error at the end of /", err)
     })
})

// /masters
// GET: gets all current master templates
router.get('/master', (req, res, next) => {
  Master.find({"approved": true}, function(err, masters) {
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
router.get('/download', (req, res, next) => {
  console.log("[pre-require]");
  var utils = new Utils();
  Tag.find({'projectId': req.optimizely.current_project}, function(err, tags) {
    console.log("[tag found]");
    if (err) {
      console.log('err finding tags in download/:projectid', err)
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(tags)); //send an array of masters
    }
  })
})

// /updatetag/:projectid/:tagid
// Post: updated information for tag
router.post('/updatetag/:tagid', (req, res, next) => {
  var utils = new Utils();
  utils.body = req.body;
  utils.body.projectId = req.optimizely.current_project;
  utils.tagid = req.params.tagid;

  console.log("I AM SETTING THE TAG ID HERE in UPDATE________________________", req.params.tagid)
  Project.findOne({projectId: req.optimizely.current_project})
         .then(utils.findMaster.bind(utils))
         .then(utils.setMaster.bind(utils))
         .then(utils.updateTag.bind(utils))
         .then(utils.chooseCallbackPath.bind(utils))
         .then(utils.populateProject.bind(utils))
         .then(utils.getJavascript.bind(utils))
         .then(utils.buildJavascript.bind(utils))
         .then(function(response) {
            res.status(200).json(utils.tag)
         })
         .catch(function(err) {
           console.log("Error at the end of /update", err)
         })
})

router.get('/options', function(req, res, next) {
  var utils = new Utils();
  utils.body = req.body;
  utils.body.projectId = req.optimizely.current_project;
  utils.tagid = req.params.tagid;
  Project.findOne({'projectId': req.optimizely.current_project})
         .then(utils.getTagOptions.bind(utils))
         .then(utils.getOptions.bind(utils))
         .then(utils.getPageOptions.bind(utils))
         .then(utils.addProjectOptions.bind(utils))
         .then(function(response) {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(response)); //send an array of options
         })
         .catch(function(err) {
           console.log("Error at the end of /options", err)
         })
})

router.get('/template', function(req, res, next){
  res.render('template')
})

router.post('/template', function(req, res, next) {
  console.log('i am inside template')
  var tokens = [];
  console.log('req.body', req.body)
  JSON.parse(req.body.fields).forEach((field)=>{
    tokens.push({'tokenName': field.token, 'tokenDisplayName': field.tokenName, 'tokenDescription': field.tokenDescription})
  })
  console.log('tokens', tokens)
  var template = req.body.template;
  // console.log(req.body.hasCallback)
  console.log('this is callback', req.body.usesOurCallback)
  if (req.body.usesOurCallback) {
    template += 'var '+req.body.checkFor+'_callback = {{{callback}}};var interval = window.setInterval(function() {if ((typeof '+req.body.checkFor+') === \''+req.body.checkForType+'\') {'+req.body.checkFor+'_callback();window.clearInterval(interval);}}, 2000);window.setTimeout(function() {window.clearInterval(interval);}, 4000);'
  }
  console.log('template', template)

  var m = new Master({
    name: req.body.type,
    displayName: req.body.displayName,
    tokens: tokens,
    tagDescription: req.body.description,
    hasCallback: req.body.hasCallback,
    usesOurCallback: req.body.usesOurCallback,
    approved: false,
    template: template,
    checkFor: req.body.checkFor,
    checkForType: req.body.checkForType
  })
  m.save(function(err, master) {
    if (err) {
      next(err);
    }
    else {
      console.log('saving new template correct', master)
      // res.redirect('/')
      res.send('i am all good')
    }
  })
})

router.get('/restrictedOptions/:tagid', function(req, res, next) {
  var utils = new Utils();
  utils.tagid = req.params.tagid;
  Tag.find({'projectId': req.optimizely.current_project})
     .then(utils.restrictOptions.bind(utils))
     .then(function(response) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(response)); //send an array of options
     })
     .catch(function(err) {
       console.log("Error at the end of /options", err)
     })
})

module.exports = router;
