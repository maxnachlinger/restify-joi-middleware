var restify = require('restify');
var async = require('async');

var server = require('./server');

var port = 8080;

var client = restify.createJsonClient({
  url: 'http://localhost:' + port,
  version: '*'
});

server().listen(8080, function (err) {
  if (err) {
    return onError(err);
  }

  async.series({
    GET: testGet,
    POST: testPost,
    PUT: testPut
  }, function (err, results) {
    if (err) {
      return onError(err);
    }
    console.log("Results:", results);
    process.exit(0);
  });
});

function onError(err) {
  console.error(err.stack);
  process.exit(1);
}

function ignoreValidationError(cb) {
  return function(err, req, res, obj) {
    if (!err || !err.name || err.name !== 'BadRequestError') {
      return cb(err, obj);
    }
    return cb(null, obj);
  };
}

function testGet(cb) {
  client.get('/test-string', ignoreValidationError(cb));
}

function testPost(cb) {
  client.post('/', {name: 0}, ignoreValidationError(cb));
}

function testPut(cb) {
  client.put('/1', {id: 2, name: 'test'}, ignoreValidationError(cb));
}
