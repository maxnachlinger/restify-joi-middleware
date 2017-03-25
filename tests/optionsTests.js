'use strict'
const test = require('tape')
const Joi = require('joi')
const errors = require('restify-errors')
const middleware = require('../')

test('options.errorTransformer transforms errors', t => {
  const transformer = (validationInput, joiError) => {
    return new errors.BadRequestError('Test')
  }

  const req = {
    params: {
      id: 'test'
    },
    route: {
      validation: {
        params: {
          id: Joi.number().required()
        }
      }
    }
  }

  middleware({allowUnknown: true}, {errorTransformer: transformer})(req, {send: t.fail}, err => {
    t.ok(err, 'An error should be returned')
    t.equal(err.message, 'Test', 'Error was transformed')
    t.end()
  })
})

test('options.errorResponder alters how the middleware responds to errors', t => {
  const responder = (transformedErr, req, res, next) => {
    res.send(200, 'Test')
    return next()
  }

  const req = {
    params: {
      id: 'test'
    },
    route: {
      validation: {
        params: {
          id: Joi.number().required()
        }
      }
    }
  }

  middleware({allowUnknown: true}, {errorResponder: responder})(req, {
    send: (code, body) => {
      t.equal(code, 200, 'Response was altered')
      t.equal(body, 'Test', 'Response was altered')
    }
  }, err => {
    t.notOk(err, 'No error should be returned')
    t.end()
  })
})
