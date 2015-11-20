var restify = require('restify');
var Joi = require('joi');

module.exports = function (joiOptions, options) {
  joiOptions = joiOptions || {
      convert: true,
      allowUnknown: true,
      abortEarly: false
    };
  options = options || {};

  options.errorTransformer = options.errorTransformer || function (validationInput, joiError) {
      var retError = new restify.errors.BadRequestError();
      retError.body.data = joiError.details;
      return retError;
    };

  options.errorResponder = options.errorResponder || function (transformedErr, req, res, next) {
      return next(transformedErr);
    };

  options.keysToValidate = options.keysToValidate || ['params', 'body', 'query', 'user', 'headers', 'trailers'];

  return function restifyJoiMiddleware(req, res, next) {
    var validation = req.route.validation;

    if (!validation) {
      return setImmediate(next);
    }

    var toValidate = options.keysToValidate.reduce(function (accum, key) {
      var value = req[key];

      if(!value) {
        // e.g. if the allowUnknown option is not set, and there's no value for body, then don't add body: {} to our
        // object to validate
        if(!joiOptions.allowUnknown) {
          return accum;
        }
        value = {};
      }

      accum[key] = value;
      return accum;
    }, {});

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
