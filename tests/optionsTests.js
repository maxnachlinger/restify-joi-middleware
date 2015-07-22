var test = require('tape');
var Joi = require('joi');
var restify = require('restify');
var middleware = require('../');

test('options.errorTransformer transforms errors', function (t) {
  var transformer = function (validationInput, joiError) {
    return new restify.errors.BadRequestError('Test');
  };

  var req = {
    params: {
      id: 'test'
    },
    route: {
      validation: {
        params: {
          id: Joi.number().required()
        }
      }
    }
  };

  middleware({allowUnknown: true}, {errorTransformer: transformer})(req, {send: t.fail}, function(err) {
    t.ok(err, 'An error should be returned');
    t.equal(err.message, 'Test', 'Error was transformed');
    t.end();
  });
});

test('options.errorResponder alters how the middleware responds to errors', function (t) {
  var responder = function (transformedErr, req, res, next) {
    res.send(200, "Test");
    return next();
  };

  var req = {
    params: {
      id: 'test'
    },
    route: {
      validation: {
        params: {
          id: Joi.number().required()
        }
      }
    }
  };

  middleware({allowUnknown: true}, {errorResponder: responder})(req, {send: function(code, body) {
    t.equal(code, 200, 'Response was altered');
    t.equal(body, 'Test', 'Response was altered');
  }}, function(err) {
    t.notOk(err, 'No error should be returned');
    t.end();
  });
});

