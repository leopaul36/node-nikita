
# `nikita.docker.stop(options, [callback])`

Stop a started container.

## Options

* `boot2docker` (boolean)   
  Whether to use boot2docker or not, default to false.
* `container` (string)   
  Name/ID of the container, required.
* `machine` (string)   
  Name of the docker-machine, required if using docker-machine.
* `timeout` (int)   
  Seconds to wait for stop before killing it

## Callback parameters

* `err`   
  Error object if any.
* `status`   
  True unless container was already stopped.

## Example

```javascript
nikita.docker.stop({
  container: 'toto'
}, function(err, is_true){
  console.log( err ? err.message : 'Container state changed to stopped: ' + status);
})
```

## Source Code

    module.exports = (options) ->
      options.log message: "Entering Docker stop", level: 'DEBUG', module: 'nikita/lib/docker/stop'
      # Global options
      options.docker ?= {}
      options[k] ?= v for k, v of options.docker
      # Validate parameters
      throw Error 'Missing container parameter' unless options.container?
      # rm is false by default only if options.service is true
      cmd = 'stop'
      cmd += " -t #{options.timeout}" if options.timeout?
      cmd += " #{options.container}"
      @docker.status shy: true, options, (err, is_running) ->
        throw err if err
        if is_running
        then options.log message: "Stopping container #{options.container}", level: 'INFO', module: 'nikita/lib/docker/stop'
        else options.log message: "Container already stopped #{options.container} (Skipping)", level: 'INFO', module: 'nikita/lib/docker/stop'
        @end() unless is_running
      @system.execute
        cmd: docker.wrap options, cmd
      , docker.callback

## Modules Dependencies

    docker = require '../misc/docker'
    util = require 'util'
