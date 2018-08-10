var express = require('express');
var router = express.Router();
var mongo = require('mongodb').MongoClient;
var assert = require('assert');

var url = 'mongodb://localhost:27017';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Form Validation', success: req.session.success, errors: req.session.errors});
  req.session.errors = null;
  req.session.success = null;
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
      res.render('index', {items: resultArray});
    });
  });
});

router.post('/insert', function(req, res, next){
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

    res.redirect('/');
  });
});

router.get('/update', function(req, res, next){
  
});

router.get('/delete', function(req, res, next){
  
});

module.exports = router;
