
mecano = require '../../src'
test = require '../test'
they = require 'ssh2-they'
http = require 'http'

describe 'wait connect', ->

  scratch = test.scratch @
  
  server = (port=12345) ->
    _ = null
    listen: (callback) ->
      _ = http.createServer (req, res) ->
        res.writeHead 200, {'Content-Type': 'text/plain'}
        res.end 'okay'
      _.listen port, callback
    close: (callback) ->
      _.close callback

  describe 'connection', ->

    they 'a single host and a single port', (ssh, next) ->
      mecano
        ssh: ssh
        server1: server 12345
      .call ->
        setTimeout @options.server1.listen, 100
      .wait_connect
        host: 'localhost'
        port: 12345
      , (err, status) ->
        status.should.be.true()
      .call  (_, callback) ->
        @options.server1.close callback
      .then next

    they 'server object', (ssh, next) ->
      mecano
        ssh: ssh
        server1: server 12345
      .call ->
        setTimeout @options.server1.listen, 100
      .wait_connect
        server: host: 'localhost', port: 12345
      , (err, status) ->
        status.should.be.true()
      .call  (_, callback) ->
        @options.server1.close callback
      .then next

    they 'server string', (ssh, next) ->
      mecano
        ssh: ssh
        server1: server 12345
      .call ->
        setTimeout @options.server1.listen, 100
      .wait_connect
        server: "localhost:12345"
      , (err, status) ->
        status.should.be.true()
      .call  (_, callback) ->
        @options.server1.close callback
      .then next

  describe 'options', ->

    they 'test status', (ssh, next) ->
      mecano
        ssh: ssh
        server1: server 12345
      # Status false
      .call (_, callback) ->
        @options.server1.listen callback
      .wait_connect
        host: 'localhost'
        port: 12345
      , (err, status) ->
        status.should.be.false()
      .call  (_, callback) ->
        @options.server1.close callback
      # Status true
      .call ->
        setTimeout @options.server1.listen, 100
      .wait_connect
        host: 'localhost'
        port: 12345
      , (err, status) ->
        status.should.be.true()
      .call  (_, callback) ->
        @options.server1.close callback
      .then next

    they 'quorum true', (ssh, next) ->
      mecano
        ssh: ssh
        server1: server 12345
        server2: server 12346
      .call (_, callback) ->
        @options.server1.listen callback
      .wait_connect
        servers: [
          { host: 'localhost', port: 12345 }
          { host: 'localhost', port: 12346 }
          { host: 'localhost', port: 12347 }
        ]
        quorum: true
        interval: 1000
        ready: (server) ->
          @options.server2.listen() if server.port is 12345
      , (err, status) ->
        status.should.be.true()
      .call  (_, callback) ->
        @options.server1.close callback
      .call  (_, callback) ->
        @options.server2.close callback
      .then next

    they 'quorum number', (ssh, next) ->
      mecano
        ssh: ssh
        server1: server 12345
        server2: server 12346
      .call (_, callback) ->
        @options.server1.listen callback
      .wait_connect
        servers: [
          { host: 'localhost', port: 12345 }
          { host: 'localhost', port: 12346 }
          { host: 'localhost', port: 12347 }
        ]
        quorum: 2
        interval: 1000
        ready: (server) ->
          @options.server2.listen() if server.port is 12345
      , (err, status) ->
        status.should.be.true()
      .call  (_, callback) ->
        @options.server1.close callback
      .call  (_, callback) ->
        @options.server2.close callback
      .then next
    