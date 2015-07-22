# restify-joi-middleware
Another joi validation middleware for restify. Inspired by [restify-joi-validator](https://github.com/markotom/restify-joi-validator)

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

// you can pass along all the joi options here
server.use(validator({
  convert: true,
  allowUnknown: true,
  abortEarly: false
}));

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

If you don't like how errors are returned, you may pass an override function to change that.
```javascript
server.use(validator({
  // joi config here
}, function (err, req, res, next) { // <-- override function 
  return res.send(400, { status: err.name, errors: err.details });
  return next(); // make sure to call next
}));

```
The following items in the http request can be validated:
```
params
headers
query
body
```
