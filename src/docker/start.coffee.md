
# `nikita.docker.restart(options, [callback])`

Start a container.

## Options

* `boot2docker` (boolean)   
  Whether to use boot2docker or not, default to false.
* `container` (string)   
  Name/ID of the container, required.
* `machine` (string)   
  Name of the docker-machine, required if using docker-machine.
* `attach` (boolean)   
  attach STDOUT/STDERR, default to false.
* `code` (int|array)   
  Expected code(s) returned by the command, int or array of int, default to 0.
* `code_skipped`   
  Expected code(s) returned by the command if it has no effect, executed will
  not be incremented, int or array of int.

## Callback parameters

* `err`   
  Error object if any.
* `status`   
  True unless container was already started.
* `stdout`   
  Stdout value(s) unless `stdout` option is provided.
* `stderr`   
  Stderr value(s) unless `stderr` option is provided.

## Example

1- builds an image from dockerfile without any resourcess

```javascript
nikita.docker.start({
  container: 'toto',
  attach: true
}, function(err, is_true, stdout, stderr){
  console.log( err ? err.message : 'Container state changed to started: ' + status);
})
```

## Source Code

    module.exports = (options) ->
      options.log message: "Entering Docker start", level: 'DEBUG', module: 'nikita/lib/docker/start'
      # Global options
      options.docker ?= {}
      options[k] ?= v for k, v of options.docker
      # Validation
      throw Error 'Missing container parameter' unless options.container?
      # rm is false by default only if options.service is true
      cmd = 'start'
      cmd += ' -a' if options.attach
      cmd += " #{options.container}"
      @docker.status shy: true, options, (err, is_running) ->
        throw err if err
        if is_running
        then options.log message: "Container already started #{options.container} (Skipping)", level: 'INFO', module: 'nikita/lib/docker/start'
        else options.log message: "Starting container #{options.container}", level: 'INFO', module: 'nikita/lib/docker/start'
        @end() if is_running
      @system.execute
        cmd: docker.wrap options, cmd
      , docker.callback

## Modules Dependencies

    docker = require '../misc/docker'
    util = require 'util'
