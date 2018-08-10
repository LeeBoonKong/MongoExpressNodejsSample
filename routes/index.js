var express = require('express');
var router = express.Router();
var mongo = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectID;
var assert = require('assert');

var url = 'mongodb://localhost:27017';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Form Validation and Mongo Database', 
                        success: req.session.success, 
                        errors: req.session.errors,
                        errorsUpdate: req.session.errorsUpdate});
  req.session.errors = null;
  req.session.errorsUpdate = null;
  req.session.success = null;
  req.session.successUpdate = null;
});

router.get('/get-data', function(req, res, next){
  var resultArray = [];

  mongo.connect(url, function(err, client){
    var db = client.db('test');

    assert.equal(null, err);
    var cursor = db.collection('user-data').find({});
    
    cursor.forEach(function(doc, err){
      assert.equal(null, err);
      resultArray.push(doc);
    }, function(){
      client.close();
      res.render('index', {title: 'Form Validation and Mongo Database',
                            items: resultArray});
    });
  });
});

router.post('/insert', function(req, res, next){
  req.check('email', 'Invalid Email Address').isEmail();
  req.check('password', 'Password is invalid').isLength({min:4}).equals(req.body.confirmPassword);
  
  var errors = req.validationErrors();
  if(!errors){
    var item ={
      email: req.body.email,
      password: req.body.password
    };

    mongo.connect(url, function(err, client){
      var db = client.db('test');

      assert.equal(null, err);
      db.collection('user-data').insertOne(item, function(err, result){
        assert.equal(null, err);
        console.log('Item Inserted');
        client.close();
      });
    });
    req.session.success = true;
  } else {
    req.session.errors = errors;
    req.session.success = false;
  }

  res.redirect('/');
});

router.post('/update', function(req, res, next){
  req.check('email', 'Invalid Email Address').isEmail();
  req.check('password', 'Invalid Password').isLength({min: 4}).equals(req.body.confirmPassword);

  var errors = req.validationErrors();
  if(!errors){
    var item = {
      email: req.body.email,
      password: req.body.password,
    };
    
    var id = req.body.userid;

    mongo.connect(url, function(err, client){
      var db = client.db('test');

      assert.equal(null, err);
      db.collection('user-data').updateOne({'_id': objectId(id)}, {$set: item}, function(err, result){
        assert.equal(null, err);
        console.log('Item Updated');
        client.close();
      })
    });
    req.session.successUpdate = true;
  } else {
    req.session.errorsUpdate = errors;
    req.session.successUpdate = false;
  }
  
  res.redirect('/');
});

router.post('/delete', function(req, res, next){
  var id = req.body.userid;

  mongo.connect(url, function(err, client){
    var db = client.db('test');

    assert.equal(null, err);
    db.collection('user-data').deleteOne({'_id': objectId(id)}, function(err,result){
      console.log('Item Deleted');
      db.close
    });
  });
  res.redirect('/');
});

module.exports = router;
