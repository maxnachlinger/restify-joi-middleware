# restify-joi-middleware
Another [joi](https://github.com/hapijs/joi) validation middleware for restify. Inspired by [restify-joi-validator](https://github.com/markotom/restify-joi-validator)

[![standard][standard-image]][standard-url]
[![travis][travis-image]][travis-url]
[![npm][npm-image]][npm-url]

[travis-image]: https://travis-ci.org/maxnachlinger/restify-joi-middleware.svg?branch=master
[travis-url]: https://travis-ci.org/maxnachlinger/restify-joi-middleware
[npm-image]: https://img.shields.io/npm/v/restify-joi-middleware.svg?style=flat
[npm-url]: https://npmjs.org/package/restify-joi-middleware
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg
[standard-url]: http://standardjs.com/

### Installation:
```
npm i restify-joi-middleware --save
```

### Note:
Requires Node ``>4.0.0``.

### Example:
This example is [available here as well](./example/server.js).
```javascript
const Joi = require('joi')
const restify = require('restify')
const {name, version} = require('./package.json')
const validator = require('restify-joi-middleware')

const server = restify.createServer({name, version})
server.use(restify.plugins.acceptParser(server.acceptable))
server.use(restify.plugins.queryParser())
server.use(restify.plugins.bodyParser({mapParams: false}))
server.use(restify.plugins.gzipResponse())

// you can pass along all the joi options here
server.use(validator())

// additional middleware etc

server.get({
  path: '/:id',
  validation: {
    params: Joi.object().keys({
      id: Joi.number().min(0).required()
    }).required()
  }
}, (req, res, next) => {
  res.send(200, {id: req.params.id})
  next()
})

server.get({
  path: '/anythingErr/:id',
  validation: {
    params: Joi.object().keys({
      id: Joi.number().min(0).required()
    }).required()
  },
  errorResponder (transformedErr, req, res, next) {
    req.ifError = transformedErr
    return next()
  }
}, (req, res, next) => {
  res.send(200, {err: req.ifError})
  next()
})

server.post({
  path: '/',
  validation: {
    body: Joi.object().keys({
      name: Joi.string().required()
    }).required()
  }
}, (req, res, next) => {
  res.send(201, {id: 1, name: req.body.name})
  next()
})

server.post({
  path: '/anything',
  joiOpts: {
    allowUnknown: true
  },
  validation: {
    body: Joi.object().keys({
      name: Joi.string().required()
    }).required()
  }
}, (req, res, next) => {
  res.send(201, {params: req.params})
  next()
})

server.put({
  path: '/:id',
  // Joi.object().keys({}) schemas work too
  validation: Joi.object().keys({
    params: Joi.object().keys({
      id: Joi.number().min(0).required()
    }).required(),
    body: Joi.object().keys({
      id: Joi.number().min(0).required(),
      name: Joi.string().required()
    }).required()
  }).assert('params.id', Joi.ref('body.id'))
}, (req, res, next) => {
  res.send(200, {id: 1, name: req.body.name})
  next()
})

server.listen(8080, () => console.log(`${server.name} listening on: ${server.url}`))
```

### Quick Example
Given the server above:
```sh
curl 'http://localhost:8080/'
# result
{
  "code": "BadRequest",
  "message": "child \"params\" fails because [child \"id\" fails because [\"id\" must be a number]]"
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
  keysToValidate: ['params', 'body', 'query', 'user', 'headers', 'trailers', 'files'],

  // changes how joi errors are transformed to be returned - no details are returned in this case
  errorTransformer: (validationInput, joiError) => new restifyErrors.BadRequestError(),

  // changes how errors are returned
  errorResponder: (transformedErr, req, res, next) => {
    res.send(400, transformedErr)
    return next()
  }
})
```
