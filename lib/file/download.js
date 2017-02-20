// Generated by CoffeeScript 1.11.1
var curl, file, fs, path, ssh2fs, url,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

module.exports = function(options) {
  var algo, protocols_ftp, protocols_http, ref, ref1, source_hash, source_url, stageDestination;
  options.log({
    message: "Entering download",
    level: 'DEBUG',
    module: 'mecano/lib/file/download'
  });
  if (!options.source) {
    return callback(new Error("Missing source: " + options.source));
  }
  if (!options.target) {
    return callback(new Error("Missing target: " + options.target));
  }
  if (/^file:\/\//.test(options.source)) {
    options.source = options.source.substr(7);
  }
  stageDestination = null;
  if (options.md5 != null) {
    if ((ref = typeof options.md5) !== 'string' && ref !== 'boolean') {
      return callback(new Error("Invalid MD5 Hash:" + options.md5));
    }
    algo = 'md5';
    source_hash = options.md5;
  } else if (options.sha1 != null) {
    if ((ref1 = typeof options.sha1) !== 'string' && ref1 !== 'boolean') {
      return callback(new Error("Invalid SHA-1 Hash:" + options.sha1));
    }
    algo = 'sha1';
    source_hash = options.sha1;
  } else {
    algo = 'md5';
  }
  protocols_http = ['http:', 'https:'];
  protocols_ftp = ['ftp:', 'ftps:'];
  options.log({
    message: "Using force: " + (JSON.stringify(options.force)),
    level: 'DEBUG',
    module: 'mecano/lib/file/download'
  });
  source_url = url.parse(options.source);
  if ((options.cache == null) && source_url.protocol === null) {
    options.cache = false;
  }
  if (options.cache == null) {
    options.cache = !!(options.cache_dir || options.cache_file);
  }
  this.call({
    "if": typeof source_hash === 'string',
    shy: true,
    handler: function(_, callback) {
      options.log({
        message: "Shortcircuit check if provided hash match target",
        level: 'WARN',
        module: 'mecano/lib/file/download'
      });
      return file.hash(options.ssh, options.target, algo, (function(_this) {
        return function(err, hash) {
          if ((err != null ? err.code : void 0) === 'ENOENT') {
            err = null;
          }
          return callback(err, source_hash === hash);
        };
      })(this));
    }
  }, function(err, end) {
    if (!end) {
      return;
    }
    options.log({
      message: "Destination with valid signature, download aborted",
      level: 'INFO',
      module: 'mecano/lib/file/download'
    });
    return this.end();
  });
  this.cache({
    "if": options.cache,
    ssh: null,
    source: options.source,
    cache_dir: options.cache_dir,
    cache_file: options.cache_file,
    headers: options.headers,
    md5: options.md5,
    proxy: options.proxy,
    location: options.location
  }, function(err, cached, file) {
    if (err) {
      throw err;
    }
    if (options.cache) {
      options.source = file;
    }
    return source_url = url.parse(options.source);
  });
  this.call(function(_, callback) {
    return ssh2fs.stat(this.options.ssh, options.target, function(err, stat) {
      if (err && err.code !== 'ENOENT') {
        return callback(err);
      }
      if (stat != null ? stat.isDirectory() : void 0) {
        options.log({
          message: "Destination is a directory",
          level: 'DEBUG',
          module: 'mecano/lib/file/download'
        });
        options.target = path.join(options.target, path.basename(options.source));
      }
      stageDestination = options.target + "." + (Date.now()) + (Math.round(Math.random() * 1000));
      return callback();
    });
  });
  this.call({
    "if": function() {
      var ref2;
      return ref2 = source_url.protocol, indexOf.call(protocols_http, ref2) >= 0;
    },
    handler: function() {
      var cmd, fail, k;
      options.log({
        message: "HTTP Download",
        level: 'DEBUG',
        module: 'mecano/lib/file/download'
      });
      fail = options.fail ? "--fail" : '';
      k = source_url.protocol === 'https:' ? '-k' : '';
      cmd = "curl " + fail + " " + k + " -s " + options.source + " -o " + stageDestination;
      if (options.proxy) {
        cmd += " -x " + options.proxy;
      }
      options.log({
        message: "Download file from url using curl",
        level: 'INFO',
        module: 'mecano/lib/file/download'
      });
      this.system.mkdir({
        shy: true,
        target: path.dirname(stageDestination)
      });
      this.execute({
        cmd: cmd,
        shy: true
      });
      this.call({
        "if": typeof source_hash === 'string',
        handler: function(_, callback) {
          return file.hash(options.ssh, stageDestination, algo, (function(_this) {
            return function(err, hash) {
              if (source_hash !== hash) {
                return callback(Error("Invalid downloaded checksum, found '" + hash + "' instead of '" + source_hash + "'"));
              }
              return callback();
            };
          })(this));
        }
      });
      this.call(function(_, callback) {
        return file.compare_hash(null, stageDestination, options.ssh, options.target, algo, function(err, match, hash1, hash2) {
          if (!match) {
            options.log({
              message: "Hash dont match, source is '" + hash1 + "' and target is '" + hash2 + "'",
              level: 'WARN',
              module: 'mecano/lib/file/download'
            });
          }
          if (match) {
            options.log({
              message: "Hash matches as '" + hash1 + "'",
              level: 'INFO',
              module: 'mecano/lib/file/download'
            });
          }
          return callback(err, !match);
        });
      });
      return this.remove({
        unless: function() {
          return this.status(-1);
        },
        shy: true,
        target: stageDestination
      });
    }
  });
  this.call({
    "if": function() {
      var ref2;
      return (ref2 = source_url.protocol, indexOf.call(protocols_http, ref2) < 0) && !options.ssh;
    },
    handler: function() {
      options.log({
        message: "File Download without ssh (with or without cache)",
        level: 'DEBUG',
        module: 'mecano/lib/file/download'
      });
      this.call(function(_, callback) {
        return file.compare_hash(null, options.source, null, options.target, algo, function(err, match, hash1, hash2) {
          if (!match) {
            options.log({
              message: "Hash dont match, source is '" + hash1 + "' and target is '" + hash2 + "'",
              level: 'WARN',
              module: 'mecano/lib/file/download'
            });
          }
          if (match) {
            options.log({
              message: "Hash matches as '" + hash1 + "'",
              level: 'INFO',
              module: 'mecano/lib/file/download'
            });
          }
          return callback(err, !match);
        });
      });
      this.system.mkdir({
        "if": function() {
          return this.status(-1);
        },
        shy: true,
        target: path.dirname(stageDestination)
      });
      return this.call({
        "if": function() {
          return this.status(-2);
        },
        handler: function(_, callback) {
          var rs, ws;
          rs = fs.createReadStream(options.source);
          rs.on('error', function(err) {
            options.log({
              message: "No such source file: " + options.source + " (ssh is " + (JSON.stringify(!!options.ssh)) + ")",
              level: 'ERROR',
              module: 'mecano/lib/file/download'
            });
            err.message = 'No such source file';
            return callback(err);
          });
          ws = fs.createWriteStream(stageDestination);
          return rs.pipe(ws).on('close', callback).on('error', callback);
        }
      });
    }
  });
  this.call({
    "if": function() {
      var ref2;
      return (ref2 = source_url.protocol, indexOf.call(protocols_http, ref2) < 0) && options.ssh;
    },
    handler: function() {
      options.log({
        message: "File Download with ssh (with or without cache)",
        level: 'DEBUG',
        module: 'mecano/lib/file/download'
      });
      this.call(function(_, callback) {
        return file.compare_hash(null, options.source, options.ssh, options.target, algo, function(err, match, hash1, hash2) {
          if (!match) {
            options.log({
              message: "Hash dont match, source is '" + hash1 + "' and target is '" + hash2 + "'",
              level: 'WARN',
              module: 'mecano/lib/file/download'
            });
          }
          if (match) {
            options.log({
              message: "Hash matches as '" + hash1 + "'",
              level: 'INFO',
              module: 'mecano/lib/file/download'
            });
          }
          return callback(err, !match);
        });
      });
      this.system.mkdir({
        "if": function() {
          return this.status(-1);
        },
        shy: true,
        target: path.dirname(stageDestination)
      });
      return this.call({
        "if": function() {
          return this.status(-2);
        },
        handler: function(_, callback) {
          var rs;
          options.log({
            message: "Local source: '" + options.source + "'",
            level: 'INFO',
            module: 'mecano/lib/file/download'
          });
          options.log({
            message: "Remote target: '" + stageDestination + "'",
            level: 'INFO',
            module: 'mecano/lib/file/download'
          });
          rs = fs.createReadStream(options.source);
          rs.on('error', function(err) {
            return console.log('rs on error', err);
          });
          return ssh2fs.writeFile(options.ssh, stageDestination, rs, function(err) {
            if (err) {
              options.log("Upload failed from local to remote");
            }
            return callback(err);
          });
        }
      });
    }
  });
  return this.call(function() {
    options.log({
      message: "Unstage downloaded file",
      level: 'DEBUG',
      module: 'mecano/lib/file/download'
    });
    this.move({
      "if": this.status(),
      source: stageDestination,
      target: options.target
    });
    this.system.chmod({
      target: options.target,
      mode: options.mode,
      "if": options.mode != null
    });
    return this.system.chown({
      target: options.target,
      uid: options.uid,
      gid: options.gid,
      "if": (options.uid != null) || (options.gid != null)
    });
  });
};

fs = require('fs');

ssh2fs = require('ssh2-fs');

path = require('path');

url = require('url');

curl = require('../misc/curl');

file = require('../misc/file');