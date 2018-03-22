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
    t.ok(err, 'Returns an error')
    t.equal(err.statusCode, 400, 'Error has a statusCode of 400')
    t.end()
  })
})

test('passes on valid request with params and body', t => {
  const req = {
    body: {
      payload: {
        email: 'test@test.com',
        password: 'test-password'
      }
    },
    params: {
      registration_token: 'test-token'
    },
    route: {
      validation: Joi.object().keys({
        params: Joi.object().keys({
          registration_token: Joi.string()
        }).required(),
        body: Joi.object().keys({
          payload: Joi.object().keys({
            email: Joi.string().email().required(),
            password: Joi.string().min(6).max(15).required()
          }).required()
        }).required()
      })
    }
  }

  middleware()(req, {send: t.fail}, (err) => {
    t.notOk(err, 'No error should be returned')
    t.end()
  })
})

test('handles v7 route definitions', t => {
  const req = {
    body: {
      payload: {
        email: 'test@test.com',
        password: 'test-password'
      }
    },
    params: {
      registration_token: 'test-token'
    },
    route: {
      spec: {
        validation: Joi.object().keys({
          params: Joi.object().keys({
            registration_token: Joi.string()
          }).required(),
          body: Joi.object().keys({
            payload: Joi.object().keys({
              email: Joi.string().email().required(),
              password: Joi.string().min(6).max(15).required()
            }).required()
          }).required()
        })
      }
    }
  }

  middleware()(req, {send: t.fail}, (err) => {
    t.notOk(err, 'No error should be returned')
    t.end()
  })
})
