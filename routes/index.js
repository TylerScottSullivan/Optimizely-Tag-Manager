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
  req.token = userContext.context.client.access_token;
  next();
});


router.get('/pageOptions', function(req, res, next) {
  var options = {
      method: 'GET',
      url: 'https://www.optimizelyapis.com/v2/pages?project_id=' + req.optimizely.current_project, 
      headers: {
       "Authorization": "Bearer " + req.token,
       "Content-Type": "application/json"
      },
      json: true
  }

  request(options).then(function(parseBody) {
    res.send(parseBody)
  }).catch(function(err) {
    res.send("DIDN'T WORK")
  })
});

router.get('/eventOptions', function(req, res, next) {
  var options = {
      method: 'GET',   
      url: "https://www.optimizelyapis.com/v2/events?project_id=" + req.optimizely.current_project,
      headers: {
         "Authorization": "Bearer " + req.token,
         "Content-Type": "application/json"
      },
      json: true
  }

  request(options). then(function(parseBody) {
    res.send(parseBody)
  }).catch(function(err) {
    res.send("EVENT OPTIONS DIDN'T WORK")
  })

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

//adding a tag
router.post('/tag', function(req, res, next) {
  //either find or create a new project object, to which we will append a new tag w/appropriate fields
  var utils = new Utils();
  utils.body = req.body;
  Project.findOne({'projectId': req.optimizely.current_project})
        .then(utils.setProjectFindMasters.bind(utils))
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

//deleting a tag
router.delete('/tag/:tagid', function(req, res, next) {
  var utils = new Utils();
  utils.tagid = req.params.tagid;
  Tag.find({"projectId": req.optimizely.current_project})
     .then(utils.removeCallbacks.bind(utils))
     .then(utils.removeTag.bind(utils))
     .then(utils.findMasters.bind(utils))
     .then(utils.setMasters.bind(utils))
     .then(utils.getProject.bind(utils, req.optimizely.current_project, req.params.tagid))
     .then(utils.removeTagFromProject.bind(utils))
     .then(utils.populateProject.bind(utils))
     .then(utils.getJavascript.bind(utils))
     .then(utils.buildJavascript.bind(utils))
     .then(function(response) {
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

router.get('/getToken', function(req, res, next) {
  console.log("HELLO THIS IS HAPPENING", req.token)
  res.send(req.token);
})



// GET: gets all current tags, find project by project id, return all tags from a current project
router.get('/tag', (req, res, next) => {
  var utils = new Utils();
  Tag.find({'projectId': req.optimizely.current_project}, function(err, tags) {
    if (err) {
      console.log('err finding tags in download/:projectid', err)
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(tags)); //send an array of masters
    }
  })
})


// Updating a tag
router.put('/tag/:tagid', (req, res, next) => {
  var utils = new Utils();
  utils.body = req.body;
  utils.body.projectId = req.optimizely.current_project;
  utils.tagid = req.params.tagid;

  Project.findOne({projectId: req.optimizely.current_project})
         .then(utils.setProjectFindMasters.bind(utils))
         .then(utils.setMasterFindTagByID.bind(utils))
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

//getting the options for a tag
router.get('/options/:tagid', function(req, res, next) {
  var utils = new Utils();
  utils.body = req.body;
  utils.body.projectId = req.optimizely.current_project;
  utils.body.token = req.token;
  if (req.params.tagid === "0") {
    utils.tagid = null;
  }
  else {
    utils.tagid = req.params.tagid;
  }
  Project.findOne({'projectId': req.optimizely.current_project})
         .then(utils.getTagOptions.bind(utils))
         .then(utils.restrictOptions.bind(utils))
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

//renders template form
router.get('/template', function(req, res, next){
  res.render('template')
})

//creates a new template
router.post('/template', function(req, res, next) {
  var tokens = [];

  //pushing token values
  JSON.parse(req.body.fields).forEach((field)=>{
    tokens.push({'tokenName': field.token, 'tokenDisplayName': field.tokenName, 'tokenDescription': field.tokenDescription})
  })

  //setting template code
  var template = req.body.template;

  //adds callback if the user chooses
  if (JSON.parse(req.body.usesOurCallback)) {
    template += 'var '+req.body.checkFor+'_callback = {{{callback}}};var interval = window.setInterval(function() {if ((typeof '+req.body.checkFor+') === \''+req.body.checkForType+'\') {'+req.body.checkFor+'_callback();window.clearInterval(interval);}}, 2000);window.setTimeout(function() {window.clearInterval(interval);}, 4000);'
  }
  Master.findOne({'name': req.body.type})
        .then(function(master) {
          if (master) {
            console.log("NAME FIELD MUST BE UNIQUE", master, req.body.type);
            throw "Name field must be unique";
          }
          else {
            var m = new Master({
                    'name': req.body.type,
                    'displayName': req.body.displayName,
                    'tokens': tokens,
                    'tagDescription': req.body.description,
                    'hasCallback': req.body.hasCallback,
                    'usesOurCallback': req.body.usesOurCallback,
                    'approved': false,
                    'template': template,
                    'checkFor': req.body.checkFor,
                    'checkForType': req.body.checkForType
                  });
            return m.save();
          }
        })
        .then(function(master) {
          res.status(200).send('Approved.')
        })
        .catch(function(err) {
          next(err);
        });
});

module.exports = router;
