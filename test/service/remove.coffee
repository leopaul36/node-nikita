
mecano = require '../../src'
test = require '../test'
they = require 'ssh2-they'

describe 'service remove', ->
  
  @timeout 20000
  config = test.config()
  return if config.disable_service

  they 'new package', (ssh, next) ->
    mecano
      ssh: ssh
    .service_install
      name: config.service.name
    .service_remove
      name: config.service.name
    , (err, status) ->
      status.should.be.true() unless err
    .service_remove
      name: config.service.name
    , (err, status) ->
      status.should.be.false() unless err
    .then next