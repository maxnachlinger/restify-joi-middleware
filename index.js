var restify = require('restify');
var Joi = require('joi');

module.exports = function (joiOptions, options) {
  options = options || {};
  joiOptions = joiOptions || {};

  options.errorTransformer = options.errorTransformer || function (validationInput, joiError) {
      var retError = new restify.errors.BadRequestError();
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

    var keysToValidate = getKeysToValidate(validation);

    var toValidate = keysToValidate.reduce(function (accum, key) {
      accum[key] = req[key] || {};
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
    keysToValidate.forEach(function (key) {
      if (!result.value[key] || !req[key]) {
        return;
      }
      req[key] = result.value[key];
    });

    next();
  };
};

function getKeysToValidate(validation) {
  if (!validation.isJoi) {
    return Object.keys(validation);
  }
  return validation._inner.children.map(function (child) {
    return child.key;
  });
}
