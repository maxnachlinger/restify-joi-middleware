'use strict'
const test = require('tape')
const Joi = require('joi')
const middleware = require('../')

// test('validation errors on invalid input', t => {
//   const req = {
//     params: {
//       id: 'this-is-a-string'
//     },
//     route: {
//       validation: {
//         params: {
//           id: Joi.number().required()
//         }
//       }
//     }
//   }
//
//   middleware()(req, {send: t.fail}, err => {
//     t.ok(err, 'Returns and error')
//     t.equal(err.statusCode, 400, 'Error has a statusCode of 400')
//     t.end()
//   })
// })
//
// test('validation allows valid input', t => {
//   const req = {
//     params: {
//       id: 1
//     },
//     route: {
//       validation: {
//         params: {
//           id: Joi.number().required()
//         }
//       }
//     }
//   }
//
//   middleware()(req, {send: t.fail}, err => {
//     t.notOk(err, 'No error should be returned')
//     t.end()
//   })
// })
//
// test('validation blocks missing input', t => {
//   // notice there's no req.params
//   const req = {
//     route: {
//       validation: {
//         params: Joi.object().keys({
//           id: Joi.number().required()
//         }).required()
//       }
//     }
//   }
//
//   middleware()(req, {send: t.fail}, err => {
//     t.ok(err, 'Returns and error')
//     t.equal(err.statusCode, 400, 'Error has a statusCode of 400')
//     t.end()
//   })
// })
//
// test('allows Joi.object().keys validations', t => {
//   const req = {
//     body: {
//       id: 1
//     },
//     params: {
//       id: 1
//     },
//     route: {
//       validation: Joi.object().keys({
//         params:{
//           id: Joi.number().required()
//         },
//         body: {
//           id: Joi.number().required()
//         }
//       })
//     }
//   }
//
//   middleware()(req, {send: t.fail}, err => {
//     t.notOk(err, 'No error should be returned')
//     t.end()
//   })
// })

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
