// Generated by CoffeeScript 2.1.1
// # `nikita.tools.gem.fetch(options, [callback])`

// Fetch a Ruby gem.

// ## Options

// * `cwd` (string)   
//   Directory storing gems.
// * `gem_bin` (string)   
//   Path to the gem command, default to 'gem'
// * `name` (string)   
//   Name of the gem, required.   
// * `version` (string)   
//   Version of the gem.

// ## Callback parameters

// * `err`   
//   Error object if any.   
// * `status`   
//   Indicate if a gem was fetch.   
// * `filename`   
//   Name of the gem file.   
// * `filepath`   
//   Path of the gem file.   

// ## Exemple

// ```js
// require('nikita')
// .tools.rubygems.fetch({
//   name: 'json',
//   version: '2.1.0',
//   cwd: '/tmp/my_gems'
// }, function(err, status, filename, filepath){
//   console.log( err ? err.messgage : 'Gem fetched: ' + status);
// });
// ```

// ## Implementation

// We do not support gem returning specification with binary strings because we
// couldn't find any suitable parser on NPM.

// ## Source code
var path;

module.exports = function(options, callback) {
  var k, ref, v;
  options.log({
    message: "Entering rubygem.fetch",
    level: 'DEBUG',
    module: 'nikita/lib/tools/rubygem/fetch'
  });
  // Global Options
  if (options.ruby == null) {
    options.ruby = {};
  }
  ref = options.ruby;
  for (k in ref) {
    v = ref[k];
    if (options[k] == null) {
      options[k] = v;
    }
  }
  if (options.gem_bin == null) {
    options.gem_bin = 'gem';
  }
  this.system.execute({
    unless: options.version,
    cmd: `${options.gem_bin} specification ${options.name} version -r | grep '^version' | sed 's/.*: \\(.*\\)$/\\1/'`,
    cwd: options.cwd,
    shy: true,
    bash: options.bash
  }, function(err, status, stdout) {
    if (err) {
      throw err;
    }
    if (status) {
      options.version = stdout.trim();
    }
    return options.target = `${options.name}-${options.version}.gem`;
  });
  this.call(function() {
    return this.system.execute({
      cmd: `${options.gem_bin} fetch ${options.name} -v ${options.version}`,
      cwd: options.cwd,
      bash: options.bash
    });
  });
  return this.next(function(err, status) {
    return callback(err, status, options.target, path.resolve(options.cwd, options.target));
  });
};

// ## Dependencies
path = require('path');
