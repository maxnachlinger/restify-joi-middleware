var restify = require('restify');
var Joi = require('joi');

module.exports = function (joiOptions, options) {
  options = options || {};
  joiOptions = joiOptions || {};

  options.keysToValidate = options.keysToValidate || [
      'params',
      'headers',
      'query',
      'body'
    ];

  options.errorTransformer = options.errorTransformer || function (validationInput, joiError) {
      var retError = new restify.errors.BadRequestError(joiError.message);
      retError.body.data = joiError.details;
      return retError;
    };

  options.errorResponder = options.errorResponder || function (transformedErr, req, res, next) {
      return next(transformedErr);
    };

  return function middleware(req, res, next) {
    var validation = req.route.validation;

    if (!validation) {
      return setImmediate(next);
    }

    var toValidate = {};

    options.keysToValidate.forEach(function (key) {
      toValidate[key] = req[key] || {};
      validation[key] = validation[key] || {};
    });

    var result = Joi.validate(toValidate, validation, joiOptions);

    if (result.error) {
      return options.errorResponder(
        options.errorTransformer(toValidate, result.error),
        req, res, next
      );
    }

    // write defaults back to request
    options.keysToValidate.forEach(function (key) {
      if (!result.value[key] || !req[key]) {
        return;
      }
      req[key] = result.value[key];
    });

    next();
  };
};
