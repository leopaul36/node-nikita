// Generated by CoffeeScript 2.1.1
// # `nikita.fs.writeFile(options, callback)`

// Options include

// * `content` (string|buffer)   
//   Content to write.
// * `target` (string)   
//   Final destination path.
// * `target_tmp` (string)   
//   Temporary file for upload before moving to final destination path.

// ## Source Code
var fs, string;

module.exports = {
  status: false,
  handler: function(options) {
    var ssh;
    options.log({
      message: "Entering fs.writeFile",
      level: 'DEBUG',
      module: 'nikita/lib/fs/writeFile'
    });
    ssh = this.ssh(options.ssh);
    if (options.argument != null) {
      // Normalize options
      options.target = options.argument;
    }
    if (!options.target) {
      throw Error("Required Option: the \"target\" option is mandatory");
    }
    if (options.content == null) {
      throw Error("Required Option: the \"content\" option is mandatory");
    }
    if (options.flags == null) {
      options.flags = 'w'; // Note, Node.js docs version 8 & 9 mention "flag" and not "flags"
    }
    if (options.sudo || options.flags[0] === 'a') {
      if (options.target_tmp == null) {
        options.target_tmp = `/tmp/nikita_${string.hash(options.target)}`;
      }
    }
    if (options.mode == null) {
      options.mode = 0o644; // Node.js default to 0o666
    }
    this.call({
      if: options.flags[0] === 'a'
    }, function() {
      return this.system.execute({
        if: options.flags[0] === 'a',
        cmd: `[ ! -f '${options.target}' ] && exit\ncp '${options.target}' '${options.target_tmp}'`
      });
    }, function(err, status) {
      return options.log(!err ? {
        message: "Append prepared by placing original file in temporary path",
        level: 'INFO',
        module: 'nikita/lib/fs/write'
      } : {
        message: "Failed to place original file in temporary path",
        level: 'ERROR',
        module: 'nikita/lib/fs/writeFile'
      });
    });
    this.call(function(_, callback) {
      options.log({
        message: 'Writting file',
        level: 'DEBUG',
        module: 'nikita/lib/fs/writeFile'
      });
      return fs.writeFile(ssh, options.target_tmp || options.target, options.content, {
        flags: options.flags,
        mode: options.mode
      }, function(err) {
        options.log(!err ? {
          message: `File uploaded at ${JSON.stringify(options.target_tmp || options.target)}`,
          level: 'INFO',
          module: 'nikita/lib/fs/writeFile'
        } : {
          message: `Fail to upload file at ${JSON.stringify(options.target_tmp || options.target)}`,
          level: 'ERROR',
          module: 'nikita/lib/fs/writeFile'
        });
        return callback(err);
      });
    });
    return this.system.execute({
      if: options.target_tmp,
      cmd: `mv '${options.target_tmp}' '${options.target}'`,
      sudo: options.sudo,
      bash: options.bash,
      arch_chroot: options.arch_chroot
    });
  }
};


// ## Dependencies
fs = require('ssh2-fs');

string = require('../misc/string');
