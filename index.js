var restify = require('restify');
var Joi = require('joi');
/*
 joiOptions - options to be passed to Joi, e.g. {convert: true, allowUnknown: true, abortEarly: false}
 errorInterceptor - function (err, req, res, next) {} - you can provide this and it will be called whenever a validation
 error occurs. Make sure to call next()!
 */
module.exports = function (joiOptions, errorInterceptor) {
  joiOptions = joiOptions || {};
  errorInterceptor = errorInterceptor || function (err, req, res, next) {
      return next(new restify.errors.BadRequestError(err.message));
    };

  return function middleware(req, res, next) {
    var validation = req.route.validation;

    if (!validation) {
      return setImmediate(next);
    }

    var reqKeysToValidate = ['params', 'headers', 'query', 'body'];
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
