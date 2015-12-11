'use strict';
const util = require('util');
const restify = require('restify');
const async = require('async');

const server = require('./server');
const port = 8080;

const client = restify.createJsonClient({
  url: 'http://localhost:' + port,
  version: '*'
});

server().listen(port, err => {
  if (err) {
    return onError(err);
  }

  async.series({
    GET: cb => {
      return client.get('/test-string', ignoreValidationError(cb));
    },
    POST: cb => {
      return client.post('/', {name: 0}, ignoreValidationError(cb));
    },
    PUT: cb => {
      client.put('/1', {id: 2, name: 'test'}, ignoreValidationError(cb));
    }
  }, (err, results) => {
    if (err) {
      return onError(err);
    }
    console.log("Results:", util.inspect(results, {depth: null}));
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
