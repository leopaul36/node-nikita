
# `nikita.kv.get(options, [callback])`

## Source Code

    module.exports = shy: true, handler: (options, callback) ->
      options.log message: "Entering kv get", level: 'DEBUG', module: 'nikita/lib/core/kv/get'
      throw Error "Engine already defined" if options.engine and @options.kv
      throw Error "No engine defined" if not options.engine and not @options.kv
      # @options.kv ?= options.engine
      @options.kv.get options.key, (err, value) ->
        callback err, true, options.key, value
