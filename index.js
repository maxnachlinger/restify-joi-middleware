'use strict';
const errors = require('restify-errors');
const Joi = require('joi');

const defaultErrorTransformer = (validationInput, joiError) => {
  var retError = new errors.BadRequestError();
  retError.body.data = joiError.details;
  return retError;
};

const defaultErrorResponder =  (transformedErr, req, res, next) => {
  return next(transformedErr);
};

const defaultKeysToValidate = ['params', 'body', 'query', 'user', 'headers', 'trailers', 'files'];

module.exports = function (joiOptions, options) {
  joiOptions = joiOptions || {
      convert: true,
      allowUnknown: true,
      abortEarly: false
    };

  options = options || {};
  options.errorTransformer = options.errorTransformer || defaultErrorTransformer;
  options.errorResponder = options.errorResponder || defaultErrorResponder;
  options.keysToValidate = options.keysToValidate || defaultKeysToValidate;

  return function restifyJoiMiddleware(req, res, next) {
    const validation = req.route.validation;

    if (!validation) {
      return setImmediate(next);
    }

    const toValidate = options.keysToValidate.reduce((accum, key) => {
      let value = req[key];

      if (!value) {
        // e.g. if the allowUnknown option is not set, and there's no value for body, then don't add body: {} to our
        // object to validate
        if (!joiOptions.allowUnknown) {
          return accum;
        }
        value = {};
      }

      accum[key] = value;
      return accum;
    }, {});

    const result = Joi.validate(toValidate, validation, joiOptions);

    if (result.error) {
      return options.errorResponder(
        options.errorTransformer(toValidate, result.error),
        req, res, next
      );
    }

    // write defaults back to request
    options.keysToValidate.forEach(key => {
      if (!result.value[key] || !req[key]) {
        return;
      }
      req[key] = result.value[key];
    });

    next();
  };
};
