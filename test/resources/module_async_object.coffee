
module.exports = who: 'me', author: 'me', handler: (options, callback) ->
  setImmediate ->
    options.log "Hello #{options.who or 'world'}"
    callback null, true
