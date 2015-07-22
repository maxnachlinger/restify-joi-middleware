# restify-joi-middleware
Another joi validation middleware for restify.

[![Build Status](https://travis-ci.org/maxnachlinger/restify-joi-middleware.svg?branch=master)](https://travis-ci.org/maxnachlinger/restify-joi-middleware)

[![NPM](https://nodei.co/npm/restify-joi-middleware.png)](https://nodei.co/npm/restify-joi-middleware/)

### Installation:
```
npm install restify-joi-middleware --save
```
### Usage:
You can also have a look at the [example](example/).
```javascript
var Joi = require('joi');
var restify = require('restify');
var validator = require('restify-joi-middleware');

var server = restify.createServer();

server.use(validator());
// additional middleware etc

server.get({
  path: '/:id',
  validation: {
    params: {
      id: Joi.number().min(0).required()
    }
  }
}, function (req, res, next) {
  res.send(200, {id: req.params.id});
  next();
});

server.post({
  path: '/',
  validation: {
    body: {
      name: Joi.string().required()
    }
  }
}, function (req, res, next) {
  res.send(201, {id: 1, name: req.body.name});
  next();
});

server.put({
  path: '/:id',
  validation: {
    params: {
      id: Joi.number().min(0).required()
    },
    body: {
      name: Joi.string().required()
    }
  }
}, function (req, res, next) {
  res.send(200, {id: 1, name: req.body.name});
  next();
});
```

The following items in the http request can be validated:
```
params
headers
query
body
```
