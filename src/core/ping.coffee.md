
# `nikita.ping(options, [callback])`

Call ping, receive pong.

This constitutes a dummy action created for demonstration purposes.

## Options

* `content` (string)   
  Message to broadcast, default to "pong".   

## Callback Parameters

*   `err` (error)   
    Error object if assertion failed.   
*   `status` (boolean)   
    Always "true".   
*   `message` (string)   
    The content options.   

## Source Code

    module.exports = (options, callback) ->
      options.log message: "Entering ping", level: 'DEBUG', module: 'nikita/lib/assert'
      options.content ?= 'pong'
      setImmediate ->
        options.log message: "Sending #{options.content}", level: 'DEBUG', module: 'nikita/lib/assert'
        callback null, true, options.content
