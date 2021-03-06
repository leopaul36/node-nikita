// Generated by CoffeeScript 2.1.1
// # `nikita.docker.build(options, [callback])`

// Return the checksum of repository:tag, if it exists. Function not native to docker.

// ## Options

// * `boot2docker` (boolean)   
//   Whether to use boot2docker or not, default to false.
// * `cwd` (string)   
//   change the working directory for the build.
// * `image` (string)   
//   Name of the image, required.
// * `repository` (string)   
//   Alias of image.
// * `machine` (string)   
//   Name of the docker-machine, required if using docker-machine.
// * `tag` (string)   
//   Tag of the image, default to latest.

// ## Callback parameters

// * `err`   
//   Error object if any.
// * `status`   
//   True if command was executed.
// * `checksum`   
//   Image cheksum if it exist, false otherwise.

// ## Source Code
var docker;

module.exports = function(options, callback) {
  var cmd, k, ref, v;
  options.log({
    message: "Entering Docker checksum",
    level: 'DEBUG',
    module: 'nikita/lib/docker/checksum'
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
  // Validation
  if (options.image == null) {
    options.image = options.repository;
  }
  if (options.image == null) {
    return callback(Error('Missing repository parameter'));
  }
  if (options.tag == null) {
    options.tag = 'latest';
  }
  cmd = `images --no-trunc | grep '${options.image}' | grep '${options.tag}' | awk '{ print $3 }'`;
  options.log({
    message: `Getting image checksum :${options.image}`,
    level: 'INFO',
    module: 'nikita/lib/docker/checksum'
  });
  return this.system.execute({
    cmd: docker.wrap(options, cmd)
  }, function(err, executed, stdout, stderr) {
    var checksum;
    checksum = stdout === '' ? false : stdout.toString().trim();
    if (executed) {
      options.log({
        message: `Image checksum for ${options.image}: ${checksum}`,
        level: 'INFO',
        module: 'nikita/lib/docker/checksum'
      });
    }
    return callback(err, executed, checksum);
  });
};

// ## Modules Dependencies
docker = require('../misc/docker');
