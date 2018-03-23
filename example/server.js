const Joi = require('joi')
const restify = require('restify')
const {name, version} = require('./package.json')
const validator = require('../')

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
