'use strict'
const test = require('tape')
const Joi = require('joi')
const middleware = require('../')

test('fails on bad input via Joi.object().keys validations', t => {
  const req = {
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
  }

  middleware()(req, {send: t.fail}, err => {
    t.ok(err, 'Returns and error')
    t.equal(err.statusCode, 400, 'Error has a statusCode of 400')
    t.end()
  })
})
