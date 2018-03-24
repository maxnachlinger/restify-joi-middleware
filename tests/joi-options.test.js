'use strict'
const Joi = require('joi')
const uuidv4 = require('uuid/v4')
const middleware = require('../')

test('when the allowUnknown option is set, validation works with additional req.params for which no ' +
  'validation is defined', (done) => {
  const req = {
    params: {
      id: 1,
      name: 'Test'
    },
    route: {
      name: uuidv4(),
      validation: {
        schema: {
          params: {
            id: Joi.number().required()
          }
        }
      }
    }
  }

  const joiOptions = {allowUnknown: true}
  middleware({joiOptions})(req, {send: done.fail}, (err) => {
    expect(err).toBeFalsy()
    done()
  })
})

test('when the allowUnknown option is not set, validation fails with additional req.params for which no ' +
  'validation is defined', (done) => {
  const req = {
    params: {
      id: 1,
      name: 'Test'
    },
    route: {
      name: uuidv4(),
      validation: {
        schema: {
          params: {
            id: Joi.number().required()
          }
        }
      }
    }
  }

  middleware({}, {})(req, {send: done.fail}, (err) => {
    expect(err).toBeTruthy()
    expect(err.statusCode).toBe(400)
    done()
  })
})

test('validation writes back converted values when the convert option is set', (done) => {
  const req = {
    params: {
      id: '2'
    },
    route: {
      name: uuidv4(),
      validation: {
        schema: {
          params: {
            id: Joi.number().required()
          }
        }
      }
    }
  }

  const joiOptions = {convert: true}
  middleware({joiOptions})(req, {send: done.fail}, (err) => {
    expect(err).toBeFalsy()
    expect(req.params.id).toBe(2)
    expect(req.params.id).not.toBe('2')
    done()
  })
})

test('validation preserves additional values present in the input when the convert and allowUnknown options ' +
  'are set', (done) => {
  const req = {
    params: {
      id: '2',
      name: 'Test'
    },
    route: {
      name: uuidv4(),
      validation: {
        schema: {
          params: {
            id: Joi.number().required()
          }
        }
      }
    }
  }

  const joiOptions = {convert: true, allowUnknown: true}
  middleware({joiOptions})(req, {send: done.fail}, (err) => {
    expect(err).toBeFalsy()
    expect(req.params.name).toBeTruthy()
    done()
  })
})

test('route joiOptions override middleware ones', (done) => {
  const req = {
    params: {
      id: '2',
      name: 'Test'
    },
    route: {
      name: uuidv4(),
      validation: {
        schema: {
          params: {
            id: Joi.number().required()
          }
        },
        options: {
          joiOptions: {allowUnknown: true}
        }
      }
    }
  }

  const joiOptions = {convert: true, allowUnknown: false}
  middleware({joiOptions})(req, {send: done.fail}, (err) => {
    expect(err).toBeFalsy()
    expect(req.params.name).toBeTruthy()
    done()
  })
})
