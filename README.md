# restify-joi-middleware
Another [joi](https://github.com/hapijs/joi) validation middleware for restify. Inspired by [restify-joi-validator](https://github.com/markotom/restify-joi-validator)

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
  // Joi.object().keys({}) schemas work too
  validation: Joi.object().keys({
    params: {
      id: Joi.number().min(0).required()
    },
    body: {
      id: Joi.number().min(0).required(),
      name: Joi.string().required()
    }
  }).assert('params.id', Joi.ref('body.id'))
}, function (req, res, next) {
  res.send(200, {id: 1, name: req.body.name});
  next();
});
```

### Quick Example
Given the server above:
```sh
curl 'http://localhost:8081/'
# result
{
   "code":"BadRequestError",
   "message":"",
   "data":[
      {
         "message":"\"id\" must be a number",
         "path":"params.id",
         "type":"number.base",
         "context":{
            "key":"id"
         }
      }
   ]
}
```

### Options:
If you don't like how errors are returned or transformed from Joi errors to restify errors, you can change that. For example:
```javascript
server.use(validator({
  convert: true,
  allowUnknown: true,
  abortEarly: false
  // .. all additional joi options
}, {
  // changes the request keys validated
  keysToValidate: ['params', 'body', 'query', 'user', 'headers', 'trailers'],
  
  // changes how joi errors are transformed to be returned
  errorTransformer: function (validationInput, joiError) {
      return new restify.errors.BadRequestError(joiError.message);
  },
  
  // changes how errors are returned
  errorResponder: function (transformedErr, req, res, next) {
    res.send(400, transformedErr);
    return next();
  }
});
```
