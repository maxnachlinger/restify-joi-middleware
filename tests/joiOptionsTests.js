'use strict'
const test = require('tape')
const Joi = require('joi')
const middleware = require('../')

test('when the allowUnknown option is set, validation works with additional req.params for which no ' +
  'validation is defined', t => {
  const req = {
    params: {
      id: 1,
      name: 'Test'
    },
    route: {
      validation: {
        params: {
          id: Joi.number().required()
        }
      }
    }
  }

  middleware({allowUnknown: true})(req, {send: t.fail}, err => {
    t.notOk(err, 'No error should be returned')
    t.end()
  })
})

test('when the allowUnknown option is not set, validation fails with additional req.params for which no ' +
  'validation is defined', t => {
  const req = {
    params: {
      id: 1,
      name: 'Test'
    },
    route: {
      validation: {
        params: {
          id: Joi.number().required()
        }
      }
    }
  }

  middleware({}, {})(req, {send: t.fail}, err => {
    t.ok(err, 'Returns and error')
    t.equal(err.statusCode, 400, 'Error has a statusCode of 400')
    t.end()
  })
})

test('validation writes back converted values when the convert option is set', t => {
  const req = {
    params: {
      id: '2'
    },
    route: {
      validation: {
        params: {
          id: Joi.number().required()
        }
      }
    }
  }
  middleware({convert: true})(req, {send: t.fail}, err => {
    t.notOk(err, 'No error should be returned')
    t.equal(typeof req.params.id, 'number', 'params.id was converted to a number')
    t.end()
  })
})

test('validation preserves additional values present in the input when the convert and allowUnknown options ' +
  'are set', t => {
  const req = {
    params: {
      id: '2',
      name: 'Test'
    },
    route: {
      validation: {
        params: {
          id: Joi.number().required()
        }
      }
    }
  }
  middleware({convert: true, allowUnknown: true})(req, {send: t.fail}, err => {
    t.notOk(err, 'No error should be returned')
    t.ok(req.params.name, 'Additional value was preserved')
    t.end()
  })
})
