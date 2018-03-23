'use strict'
const errors = require('restify-errors')
const joi = require('joi')

const defaultErrorTransformer = (validationInput, joiError) => {
  const retError = new errors.BadRequestError()
  retError.body.message = joiError.message
  retError.body.data = joiError.details
  return retError
}

const defaultErrorResponder = (transformedErr, req, res, next) => next(transformedErr)

const defaultKeysToValidate = ['params', 'body', 'query', 'user', 'headers', 'trailers', 'files']

const middleware = (joiOptions, options) => (req, res, next) => {
  // restify v7 uses req.route.spec
  const routeDefinition = req.route.spec || req.route
  const {validation} = routeDefinition

  if (!validation) {
    return setImmediate(next)
  }

  const toValidate = options.keysToValidate.reduce((accum, key) => {
    // only include keys present in our validation

    // validation can be a Joi schema, so the exclusion logic is a bit different
    if (validation.isJoi) {
      if (!joi.reach(validation, key)) {
        return accum
      }
    } else if (!validation[key]) {
      return accum
    }

    accum[key] = req[key]
    return accum
  }, {})

  const result = joi.validate(toValidate, validation, joiOptions)

  if (result.error) {
    return options.errorResponder(
      options.errorTransformer(toValidate, result.error),
      req, res, next
    )
  }

  // write defaults back to request
  options.keysToValidate.forEach(key => {
    if (!result.value[key] || !req[key]) {
      return
    }
    req[key] = result.value[key]
  })

  next()
}

module.exports = (joiOptions, options) => {
  const localJoiOptions = joiOptions || {
    convert: true,
    allowUnknown: false,
    abortEarly: false
  }

  const localOptions = options || {}
  localOptions.errorTransformer = localOptions.errorTransformer || defaultErrorTransformer
  localOptions.errorResponder = localOptions.errorResponder || defaultErrorResponder
  localOptions.keysToValidate = localOptions.keysToValidate || defaultKeysToValidate

  return middleware(localJoiOptions, localOptions)
}
