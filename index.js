'use strict'
const errors = require('restify-errors')
const joi = require('joi')

const middlewareDefaults = {
  joiOptions: {
    convert: true,
    allowUnknown: false,
    abortEarly: false
  },
  errorTransformer: (validationInput, joiError) => {
    const retError = new errors.BadRequestError()
    retError.body.message = joiError.message
    retError.body.data = joiError.details
    return retError
  },
  errorResponder: (transformedErr, req, res, next) => next(transformedErr),
  keysToValidate: ['params', 'body', 'query', 'user', 'headers', 'trailers', 'files']
}

const optionsSchema = {
  joiOptions: joi.object(),
  errorTransformer: joi.func(),
  errorResponder: joi.func(),
  keysToValidate: joi.array().items(joi.string())
}

const checkOptions = (defaults, input) => {
  const { joiOptions, errorTransformer, errorResponder, keysToValidate } = defaults
  const schema = {
    joiOptions: optionsSchema.joiOptions.default(joiOptions),
    errorTransformer: optionsSchema.errorTransformer.default(errorTransformer),
    errorResponder: optionsSchema.errorResponder.default(errorResponder),
    keysToValidate: optionsSchema.keysToValidate.default(keysToValidate)
  }

  const { value, error } = joi.validate(input, schema, middlewareDefaults.joiOptions)
  if (error) {
    error.message = `Error: restify-joi-middleware, bad configuration found: ${error.message}`
    throw error
  }
  return value
}

// should this use a lru cache?
const routeOptionsCache = {}

const getRouteOptions = (middlewareOptions, route) => {
  const { name } = route
  if (routeOptionsCache[name]) {
    return routeOptionsCache[name]
  }

  // restify v7 uses req.route.spec
  const routeDefinition = route.spec || route
  const { options = middlewareOptions } = routeDefinition.validation || {}

  if (!routeOptionsCache[name]) {
    // validate route overrides, default to middleware options
    routeOptionsCache[name] = checkOptions(middlewareOptions, options)
  }

  return routeOptionsCache[name]
}

const middleware = (mOptions = {}) => {
  const middlewareOptions = checkOptions(middlewareDefaults, mOptions)

  return (req, res, next) => {
    // restify v7 uses req.route.spec
    const routeDefinition = req.route.spec || req.route
    const { schema } = routeDefinition.validation || {}

    // no validation found on route
    if (!schema) {
      return setImmediate(next)
    }

    const {
      joiOptions, errorTransformer, errorResponder, keysToValidate
    } = getRouteOptions(middlewareOptions, req.route)

    const toValidate = keysToValidate.reduce((accum, key) => {
      // only include keys present in our validation

      // validation can be a Joi schema, so the exclusion logic is a bit different
      if (schema.isJoi) {
        if (!joi.reach(schema, key)) {
          return accum
        }
      } else if (!schema[key]) {
        return accum
      }

      accum[key] = req[key]
      return accum
    }, {})

    const { error, value } = joi.validate(toValidate, schema, joiOptions)

    if (error) {
      return errorResponder(
        errorTransformer(toValidate, error),
        req, res, next
      )
    }

    // write defaults back to request
    keysToValidate.forEach(key => {
      if (!value[key] || !req[key]) {
        return
      }
      req[key] = value[key]
    })

    next()
  }
}

module.exports = middleware
