'use strict'
const Joi = require('joi')
const uuidv4 = require('uuid/v4')
const middleware = require('../')

test('fails on bad input via Joi.object().keys validations', (done) => {
  const req = {
    body: {
      id: 1
    },
    params: {
      id: 2
    },
    route: {
      name: uuidv4(),
      validation: {
        schema: Joi.object().keys({
          params: {
            id: Joi.number().required()
          },
          body: {
            id: Joi.number().required()
          }
        }).assert('params.id', Joi.ref('body.id'))
      }
    }
  }

  middleware()(req, { send: done.fail }, (err) => {
    expect(err).toBeTruthy()
    expect(err.statusCode).toBe(400)
    done()
  })
})

test('passes on valid request with params and body', (done) => {
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
      name: uuidv4(),
      validation: {
        schema: Joi.object().keys({
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

  middleware()(req, { send: done.fail }, (err) => {
    expect(err).toBeFalsy()
    done()
  })
})

test('handles v7 route definitions', (done) => {
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
      name: uuidv4(),
      spec: {
        validation: {
          schema: Joi.object().keys({
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
  }

  middleware()(req, { send: done.fail }, (err) => {
    expect(err).toBeFalsy()
    done()
  })
})
