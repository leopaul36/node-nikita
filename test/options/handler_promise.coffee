
nikita = require '../../src'
fs = require 'fs'

describe 'options "handler" return promise', ->
  
  describe 'resolve', ->

    it 'without argument is called', ->
      called = false
      nikita
      .call
        handler: ->
          new Promise (resolve, reject) ->
            setImmediate ->
              called = true
              resolve()
      , (err, value) ->
        value.should.be.false()
      .next ->
        called.should.be.true()
      .promise()

    it 'status true', ->
      nikita
      .call
        handler: ->
          new Promise (resolve, reject) ->
            setImmediate -> resolve true
      , (err, status) ->
        status.should.be.true()
      .promise()

    it 'status false', ->
      nikita
      .call
        handler: ->
          new Promise (resolve, reject) ->
            setImmediate -> resolve false
      , (err, status) ->
        status.should.be.false()
      .promise()

    it 'array is converted to arguments', ->
      nikita
      .call
        handler: ->
          new Promise (resolve, reject) ->
            setImmediate -> resolve [false, 'a value']
      , (err, status, value) ->
        status.should.be.false()
        value.should.eql 'a value'
      .promise()
        
  describe 'reject', ->

    it 'without arguments get default error', ->
      nikita
      .call
        handler: ->
          new Promise (resolve, reject) ->
            setImmediate -> reject()
      , (err, value) ->
        err.message.should.eql 'Rejected Promise: reject called without any arguments'
      .next (err) ->
        err.message.should.eql 'Rejected Promise: reject called without any arguments'
      .promise()

    it 'with an error', ->
      nikita
      .call
        handler: ->
          new Promise (resolve, reject) ->
            setImmediate -> reject Error 'throw me'
      , (err, value) ->
        err.message.should.eql 'throw me'
      .next (err) ->
        err.message.should.eql 'throw me'
      .promise()
  
  describe 'invalid', ->
    
    it 'is incompatible with async mode', ->
      nikita
      .call
        handler: (options, callback) ->
          new Promise (resolve, reject) ->
            setImmediate -> resolve()
      , (err, value) ->
        err.message.should.eql 'Invalid Promise: returning promise is not supported in asynchronuous mode'
      .next (err) ->
        err.message.should.eql 'Invalid Promise: returning promise is not supported in asynchronuous mode'
      .promise()
      
