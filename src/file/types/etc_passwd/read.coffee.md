
# `nikita.system.etc_passwd.read(options, [callback])`

Read and parse the passwd definition file located in "/etc/passwd".

## Options

* `cache` (boolean)   
  Cache the result inside the store.
* `target` (string)   
  Path to the passwd definition file, default to "/etc/passwd".
* `uid` (string|integer)   
  Retrieve the information for a specific user name or uid.

## Source Code

    module.exports = shy: true, handler: (options, callback) ->
      options.log message: "Entering etc_passwd.read", level: 'DEBUG', module: 'nikita/lib/system/etc_passwd/read'
      throw Error 'Invalid Option: uid must be a string or a number' if options.uid and not typeof options.uid in ['string', 'number']
      options.uid = parseInt options.uid, 10 if typeof options.uid is 'string' and /\d+/.test options.uid
      options.target ?= '/etc/passwd'
      # Retrieve passwd from cache
      passwd = null
      @call
        if: options.cache and !!@store['nikita:etc_passwd']
      , ->
        options.log message: "Get passwd definition from cache", level: 'INFO', module: 'nikita/lib/system/etc_passwd/read'
        passwd = @store['nikita:etc_passwd']
      # Read system passwd and place in cache if requested
      @fs.readFile
        unless: options.cache and !!@store['nikita:etc_passwd']
        target: options.target
        encoding: 'ascii'
      , (err, content) ->
        throw err if err
        return unless content?
        passwd = {}
        for line in string.lines content
          line = /(.*)\:\w\:(.*)\:(.*)\:(.*)\:(.*)\:(.*)/.exec line
          continue unless line
          passwd[line[1]] = user: line[1], uid: parseInt(line[2]), gid: parseInt(line[3]), comment: line[4], home: line[5], shell: line[6]
        @store['nikita:etc_passwd'] = passwd if options.cache
      # Pass the passwd information
      @next (err) ->
        return callback err if err
        return callback null, true, passwd unless options.uid
        if typeof options.uid is 'string'
          user = passwd[options.uid]
          return callback Error "Invalid Option: no uid matching #{JSON.stringify options.uid}" unless user
          callback null, true, user
        else
          user = Object.values(passwd).filter((user) -> user.uid is options.uid)[0]
          return callback Error "Invalid Option: no uid matching #{JSON.stringify options.uid}" unless user
          callback null, true, user
      
## Dependencies

    string = require '../../../misc/string'
