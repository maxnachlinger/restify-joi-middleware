var test = require('tape');
var Joi = require('joi');
var middleware = require('../');

test("validation errors on invalid input", function (t) {
  var req = {
    params: {
      id: 'this-is-a-string'
    },
    route: {
      validation: {
        params: {
          id: Joi.number().required()
        }
      }
    }
  };

  middleware()(req, {send: t.fail}, function (err) {
    t.ok(err, 'Returns and error');
    t.equal(err.statusCode, 400, 'Error has a statusCode of 400');
    t.end();
  });
});

test("validation allows valid input", function (t) {
  var req = {
    params: {
      id: 1
    },
    route: {
      validation: {
        params: {
          id: Joi.number().required()
        }
      }
    }
  };

  middleware()(req, {send: t.fail}, function (err) {
    t.notOk(err, 'No error should be returned');
    t.end();
  });
});
