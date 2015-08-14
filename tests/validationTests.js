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

test("validation blocks missing input", function (t) {
  // notice there's no req.params
  var req = {
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

test("allows Joi.object().keys validations", function (t) {
  var req = {
    body: {
      id: 1
    },
    params: {
      id: 1
    },
    route: {
      validation: Joi.object().keys({
        params: {
          id: Joi.number().required()
        },
        body: {
          id: Joi.number().required()
        }
      }).assert('params.id', Joi.ref('body.id'))
    }
  };

  middleware()(req, {send: t.fail}, function (err) {
    t.notOk(err, 'No error should be returned');
    t.end();
  });
});

test("fails on bad input via Joi.object().keys validations", function (t) {
  var req = {
    body: {
      id: 1
    },
    params: {
      id: 2
    },
    route: {
      validation: Joi.object().keys({
        params: {
          id: Joi.number().required()
        },
        body: {
          id: Joi.number().required()
        }
      }).assert('params.id', Joi.ref('body.id'))
    }
  };

  middleware()(req, {send: t.fail}, function (err) {
    t.ok(err, 'Returns and error');
    t.equal(err.statusCode, 400, 'Error has a statusCode of 400');
    t.end();
  });
});
