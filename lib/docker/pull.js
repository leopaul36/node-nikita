// Generated by CoffeeScript 2.1.1
// # `nikita.docker.pull(options, [callback])`

// Pull a container

// ## Options

// * `tag` (string)   
//   Name of the tag to pull.   
// * `version` (string)   
//   Version of the tag to control.  Default to `latest`.   
// * `code_skipped` (string)   
//   The exit code to skip if different from 0.   
// * `all` (Boolean)   
//   Download all tagged images in the repository.  Default to false.   

// ## Callback parameters

// * `err`   
//   Error object if any.
// * `status`   
//   True if container was pulled.
// * `stdout`   
//   Stdout value(s) unless `stdout` option is provided.
// * `stderr`   
//   Stderr value(s) unless `stderr` option is provided.

// ## Example

// 1- builds an image from dockerfile without any resourcess

// ```javascript
// nikita.docker_pull({
//   tag: 'postgresql'
// }, function(err, status, stdout, stderr){
//   console.log( err ? err.message : 'Container pulled: ' + status);
// })
// ```

// ## Source Code
var docker, util;

module.exports = function(options, callback) {
  var cmd, cmd_images, k, ref, v, version;
  options.log({
    message: "Entering Docker pull",
    level: 'DEBUG',
    module: 'nikita/lib/docker/pull'
  });
  // Global options
  if (options.docker == null) {
    options.docker = {};
  }
  ref = options.docker;
  for (k in ref) {
    v = ref[k];
    if (options[k] == null) {
      options[k] = v;
    }
  }
  // Validate parameters
  version = options.version || options.tag.split(':')[1] || 'latest';
  delete options.version; // present in misc.docker.options, will probably disappear at some point
  if (options.all == null) {
    options.all = false;
  }
  cmd_images = 'images';
  cmd_images += ` | grep '${options.tag}'`;
  if (!options.all) {
    cmd_images += ` | grep '${version}'`;
  }
  if (options.tag == null) {
    throw Error('Missing Tag Name');
  }
  // rm is false by default only if options.service is true
  cmd = 'pull';
  cmd += options.all ? ` -a ${options.tag}` : ` ${options.tag}:${version}`;
  this.system.execute({
    cmd: docker.wrap(options, cmd_images),
    code_skipped: 1
  });
  return this.system.execute({
    unless: function() {
      return this.status(-1);
    },
    cmd: docker.wrap(options, cmd),
    code_skipped: options.code_skipped
  }, function(err, status) {
    return callback(err, status);
  });
};

// ## Modules Dependencies
docker = require('../misc/docker');

util = require('util');
