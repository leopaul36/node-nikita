// Generated by CoffeeScript 1.7.1
var child, conditions, each, execute, fs, misc, path, write;

fs = require('ssh2-fs');

path = require('path');

each = require('each');

misc = require('./misc');

conditions = require('./misc/conditions');

child = require('./misc/child');

execute = require('./execute');

write = require('./write');

module.exports = function(goptions, options, callback) {
  var finish, result, _ref;
  _ref = misc.args(arguments, {
    parallel: 1
  }), goptions = _ref[0], options = _ref[1], callback = _ref[2];
  result = child();
  finish = function(err, uploaded) {
    if (callback) {
      callback(err, uploaded);
    }
    return result.end(err, uploaded);
  };
  misc.options(options, function(err, options) {
    var uploaded;
    if (err) {
      return finish(err);
    }
    uploaded = 0;
    return each(options).parallel(goptions.parallel).on('item', function(options, next) {
      return conditions.all(options, next, function() {
        var do_checksum, do_end, do_md5, do_sha1, do_stat, do_upload, get_checksum;
        if (options.binary) {
          get_checksum = function(path, digest, callback) {
            return execute({
              ssh: options.ssh,
              cmd: "openssl " + digest + " " + path,
              log: options.log,
              stdout: options.stdout,
              stderr: options.stderr
            }, function(err, executed, stdout, stderr) {
              if (err) {
                return callback(err);
              }
              return callback(null, /[ ](.*)$/.exec(stdout.trim())[1]);
            });
          };
          do_stat = function() {
            if (typeof options.log === "function") {
              options.log("Check if " + options.destination + " exists remotely");
            }
            return fs.stat(options.ssh, options.destination, function(err, stat) {
              if ((err != null ? err.code : void 0) === 'ENOENT') {
                return do_upload();
              }
              if (err) {
                return next(err);
              }
              if (stat.isDirectory()) {
                options.destination = "" + options.destination + "/" + (path.basename(options.source));
              }
              return do_checksum();
            });
          };
          do_checksum = function() {
            if (!(options.md5 || options.sha1)) {
              return do_upload();
            }
            if (typeof options.log === "function") {
              options.log("Make sure destination checksum is valid");
            }
            switch (false) {
              case options.md5 == null:
                return get_checksum(options.destination, 'md5', function(err, md5) {
                  if (err) {
                    return next(err);
                  }
                  if (md5 === options.md5) {
                    return next();
                  } else {
                    return do_upload();
                  }
                });
              case options.sha1 == null:
                return get_checksum(options.destination, 'sha1', function(err, sha1) {
                  if (err) {
                    return next(err);
                  }
                  if (sha1 === options.sha1) {
                    return next();
                  } else {
                    return do_upload();
                  }
                });
            }
          };
          do_upload = function() {
            if (typeof options.log === "function") {
              options.log("Upload " + options.source);
            }
            return fs.createWriteStream(options.ssh, options.destination, function(err, ws) {
              if (err) {
                return next(err);
              }
              return fs.createReadStream(null, options.source, function(err, rs) {
                if (err) {
                  return next(err);
                }
                return rs.pipe(ws).on('close', function() {
                  uploaded++;
                  return do_md5();
                }).on('error', next);
              });
            });
          };
          do_md5 = function() {
            if (!options.md5) {
              return do_sha1();
            }
            if (typeof options.log === "function") {
              options.log("Check md5 for '" + options.destination + "'");
            }
            return get_checksum(options.destination, 'md5', function(err, md5) {
              if (md5 !== options.md5) {
                return next(new Error("Invalid md5 checksum"));
              }
              return do_sha1();
            });
          };
          do_sha1 = function() {
            if (!options.sha1) {
              return do_end();
            }
            if (typeof options.log === "function") {
              options.log("Check sha1 for '" + options.destination + "'");
            }
            return get_checksum(options.destination, 'sha1', function(err, sha1) {
              if (sha1 !== options.sha1) {
                return next(new Error("Invalid sha1 checksum"));
              }
              return do_end();
            });
          };
          do_end = function() {
            if (typeof options.log === "function") {
              options.log("Upload succeed in " + options.destination);
            }
            return next();
          };
          return do_stat();
        }
        options = misc.merge(options, {
          local_source: true
        });
        return write(options, function(err, written) {
          if (written === 1) {
            uploaded++;
          }
          return next(err);
        });
      });
    }).on('both', function(err) {
      return finish(err, uploaded);
    });
  });
  return result;
};