'use strict'
const Joi = require('joi')
const errors = require('restify-errors')
const uuidv4 = require('uuid/v4')
const middleware = require('../')

test('throws on invalid middleware options', () => {
  expect(() => middleware({errorTransformer: {}}))
    .toThrowError(/Error: restify-joi-middleware, bad configuration found/)
})

test('throws on invalid route options', () => {
  const req = {
    params: {
      id: 'test'
    },
    route: {
      name: uuidv4(),
      validation: {
        schema: {
          params: {
            id: Joi.number().required()
          }
        },
        options: {errorTransformer: {}}
      }
    }
  }

  expect(() => middleware()(req, {}, () => null))
    .toThrowError(/Error: restify-joi-middleware, bad configuration found/)
})

test('options.errorTransformer transforms errors', (done) => {
  const testErrorMessage = uuidv4()
  const errorTransformer = jest.fn().mockReturnValue(new errors.BadRequestError(testErrorMessage))

  const req = {
    params: {
      id: 'test'
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
  middleware({joiOptions, errorTransformer})(req, {send: done.fail}, (err) => {
    expect(err).toBeTruthy()
    expect(err.message).toBe(testErrorMessage)
    expect(errorTransformer).toHaveBeenCalledTimes(1)
    done()
  })
})

test('route errorTransformer overrides middleware errorTransformer', (done) => {
  const testErrorMessage = uuidv4()
  const errorTransformer = jest.fn().mockReturnValue(new errors.BadRequestError('Test'))
  const routeErrorTransformer = jest.fn().mockReturnValue(new errors.BadRequestError(testErrorMessage))

  const req = {
    params: {
      id: 'test'
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
          errorTransformer: routeErrorTransformer
        }
      }
    }
  }

  const joiOptions = {allowUnknown: true}
  middleware({joiOptions, errorTransformer})(req, {send: done.fail}, (err) => {
    expect(err).toBeTruthy()
    expect(err.message).toBe(testErrorMessage)
    expect(errorTransformer).not.toHaveBeenCalled()
    expect(routeErrorTransformer).toHaveBeenCalledTimes(1)
    done()
  })
})

test('options.errorResponder alters how the middleware responds to errors', (done) => {
  const testMessage = uuidv4()
  const errorResponder = jest.fn((transformedErr, req, res, next) => {
    res.send(200, testMessage)
    return next()
  })

  const req = {
    params: {
      id: 'test'
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
  middleware({joiOptions, errorResponder})(req, {
    send: (code, body) => {
      expect(code).toBe(200)
      expect(body).toBe(testMessage)
      expect(errorResponder).toHaveBeenCalledTimes(1)
      done()
    }
  }, (err) => {
    expect(err).toBeFalsy()
    done()
  })
})

test('route errorResponder overrides middleware errorResponder', (done) => {
  const testMessage = uuidv4()
  const errorResponder = jest.fn((transformedErr, req, res, next) => {
    res.send(400, 'Test')
    return next()
  })
  const routeErrorResponder = jest.fn((transformedErr, req, res, next) => {
    res.send(200, testMessage)
    return next()
  })

  const req = {
    params: {
      id: 'test'
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
          errorResponder: routeErrorResponder
        }
      }
    }
  }

  const joiOptions = {allowUnknown: true}
  middleware({joiOptions, errorResponder})(req, {
    send: (code, body) => {
      expect(code).toBe(200)
      expect(body).toBe(testMessage)
      expect(errorResponder).not.toHaveBeenCalled()
      expect(routeErrorResponder).toHaveBeenCalledTimes(1)
      done()
    }
  }, (err) => {
    expect(err).toBeFalsy()
    done()
  })
})
