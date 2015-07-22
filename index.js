var restify = require('restify');
var Joi = require('joi');

module.exports = function (joiOptions, errorInterceptor) {
  joiOptions = joiOptions || {};
  errorInterceptor = errorInterceptor || function (err, req, res, next) {
      var retError = new restify.errors.BadRequestError(err.message);
      retError.body.data = err.details;
      return next(retError);
    };

  var reqKeysToValidate = [
    'params',
    'headers',
    'query',
    'body'
  ];

  return function middleware(req, res, next) {
    var validation = req.route.validation;

    if (!validation) {
      return setImmediate(next);
    }

    var toValidate = {};

    reqKeysToValidate.forEach(function (key) {
      toValidate[key] = req[key] || {};
      validation[key] = validation[key] || {};
    });

    var result = Joi.validate(toValidate, validation, joiOptions);
    if (result.error) {
      return errorInterceptor(result.error, req, res, next);
    }

    // write defaults back to request
    reqKeysToValidate.forEach(function (key) {
      if (!result.value[key] || !req[key]) {
        return;
      }
      req[key] = result.value[key];
    });

    next();
  };
};
