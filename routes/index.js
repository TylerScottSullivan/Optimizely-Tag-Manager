var express = require('express');
var router = express.Router();
var canvasSdk = require('optimizely-canvas-sdk');
var Project = require('../models/models').Project;
var Master = require('../models/models').Master;
var Tag = require('../models/models').Tag;
var request = require('request-promise');
var snippets = require('../snippets')
var findOrCreate = require('mongoose-findorcreate')

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

router.post('/customSnippet', function(req, res, next) {
  console.log('req.body', req.body)
  var t = new Tag({
    name: 'custom',
    displayName: req.body.name,
    tagDescription: req.body.tagDescription,
    fields: [],
    approved: true,
    custom: req.body.custom,
    trackingTrigger: req.body.trackingTrigger,
    projectId: req.body.projectId,
    active: req.body.active
  })
  t.save(function(err, tag) {
    if (err) {
      console.log("Error in index.js line 49 saving custom snippet tag", err)
    }
    else {
      res.status(200).send("Okay with saving the custom snippet")
    }
  })
})

router.post('/', function(req, res, next) {

  //getting the signedRequest from Optimizely
  var signedRequest = req.query.signed_request;

  //decoding the signedRequest using the secret
  var userContext = canvasSdk.extractUserContext(process.env.SECRET, signedRequest);

  //either find or create a new project object, to which we will append a new tag w/appropriate fields
  var utils = require('../utils')
  utils.body = req.body;
  Project.findOrCreate({'projectId': userContext.context.environment.current_project},
                       {'accountId': userContext.context.environment.current_account,
                       'tags': [],
                       'projectId': userContext.context.environment.current_project})
        .then(utils.findMaster.bind(utils))
        .then(utils.createTag.bind(utils))
        .then(utils.updateProject.bind(utils))
        .then(utils.populateProject.bind(utils))
        .then(utils.getJavascript.bind(utils))
        .then(utils.buildJavascript.bind(utils))
        .then(function(response) {
          res.status(200).send('I am alright')
        })
        .catch(function(err) {
          console.log("Error at the end of /", err)
        })
});

router.post('/deletetag/:tagid', function(req, res, next) {
  Tag.remove({"_id": req.params.tagid}, function(err, results) {
    if (err) console.log('error deleting', err)
    console.log(results);
    res.status(200).send("ITS ALL GOOD IN THE HOOD")
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
  console.log('req.body ini the bad end', req.body)
  Tag.findById(req.params.tagid, function(err, tag) {
    if (err) {
      console.log('err updating tags', err)
    } else {
      // tag.name = req.body.name;
      tag.fields = JSON.parse(req.body.fields);
      tag.approved = req.body.approved;
      // tag.tagDescription = req.body.tagDescription;
      tag.trackingTrigger = req.body.trackingTrigger;
      tag.custom = req.body.custom;
      tag.rank = req.body.rank;
      tag.projectId = req.body.projectId;
      tag.active = req.body.active;
      tag.save(function(err) {
        if (err) {
          console.log("err saving tag in update", err)
        } else {
          res.send("update success")
        }
      })
    }
  })
})

router.get('/options', function(req, res, next) {
  var utils = require('../utils')
  var signedRequest = req.query.signed_request;
  var userContext = canvasSdk.extractUserContext(process.env.SECRET, signedRequest);

  Project.find({'projectId': userContext.context.environment.current_project})
         .then(utils.getTagOptions.bind(utils))
         .then(utils.getOptions.bind(utils))
         .then(utils.addProjectOptions.bind(utils))
         .then(function(response) {
           console.log("THIS IS THE RESPONSE", response)
           res.status(200).send('I am alright')
         })
         .catch(function(err) {
           console.log("Error at the end of /options", err)
         })
})

router.get('/template', function(req, res, next){
  res.render('template')
})

router.post('/template', function(req, res, next) {
  var tokens = [];
  tokens.push({'tokenName': req.body.tokenName, 'tokenDisplayName': req.body.tokenDisplayName, 'tokenDescription': req.body.tokenDescription, 'tokenCode': '123456789'})
  var m = new Master({
    name: req.body.type,
    displayName: req.body.displayName,
    tokens: tokens,
    tagDescription: req.body.description,
    hasCallback: true,
    approved: false,
    template: req.body.custom,
    callbackCode: 'abcdefg'
  })
  m.save(function(err, master) {
    if (err) console.log(error, "HEyyyyyy got an error");
    else {
      res.redirect('/')
    }
  })
})

router.get('/approve', function(req, res, next) {
  Master.find({"approved": false}, function(err, masters) {
    res.render('templateApproval', {masters: masters})
  })
})

router.post('/approve', function(req, res, next) {
  var utils = require('../utils')
  //TODO this needs to be changed to incorporate master from form
  //find the master to UPDATE
  //change it's template to handlebars compiled code
  //change approved to true
  Master.findOne({'name': 'segment'})
        .then(utils.approve.bind(utils))
        .then(function(response) {
          res.status(200).send('I am guccigucci')
        })
        .catch(function(err) {
          console.log("Error at the end of /options", err)
        })
})

module.exports = router;
