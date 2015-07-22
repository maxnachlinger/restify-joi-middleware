var Joi = require('joi');
var restify = require('restify');
var validator = require('../');

module.exports = function () {
  var server = restify.createServer();

  server.on('uncaughtException', function (req, res, route, err) {
    console.log('uncaughtException', err.stack);
  });

  server.use(restify.acceptParser(server.acceptable));
  server.use(restify.queryParser());
  server.use(restify.bodyParser({mapParams: false}));
  server.use(restify.gzipResponse());
  server.use(validator());

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

  return server;
};
