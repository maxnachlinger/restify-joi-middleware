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
    schema: {
      params: Joi.object().keys({
        id: Joi.number().min(0).required()
      }).required()
    }
  }
}, (req, res, next) => {
  res.send(200, {id: req.params.id})
  next()
})

server.post({
  path: '/',
  validation: {
    schema: {
      body: Joi.object().keys({
        name: Joi.string().required()
      }).required()
    },
    // overrides middleware settings for this route
    options: {
      joiOptions: {
        allowUnknown: false
      }
    }
  }
}, (req, res, next) => {
  res.send(201, {id: 1, name: req.body.name})
  next()
})

server.put({
  path: '/:id',
  // Joi.object().keys({}) schemas work too
  validation: {
    schema: Joi.object().keys({
      params: Joi.object().keys({
        id: Joi.number().min(0).required()
      }).required(),
      body: Joi.object().keys({
        id: Joi.number().min(0).required(),
        name: Joi.string().required()
      }).required()
    }).assert('params.id', Joi.ref('body.id'))
  }
}, (req, res, next) => {
  res.send(200, {id: 1, name: req.body.name})
  next()
})

server.listen(8080, () => console.log(`${server.name} listening on: ${server.url}`))
