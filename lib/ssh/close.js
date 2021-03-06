// Generated by CoffeeScript 2.1.1
// # `nikita.ssh.close(options, [callback])`

// Close the existing connection if any.

// ## Options

// There are no options.

// ## Source code
module.exports = {
  handler: function(options, callback) {
    var ssh;
    options.log({
      message: "Entering ssh.close",
      level: 'DEBUG',
      module: 'nikita/lib/ssh/close'
    });
    if (!this.store['nikita:ssh:connection']) {
      return callback();
    }
    ssh = this.store['nikita:ssh:connection'];
    ssh.end();
    ssh.on('error', function(err) {
      return callback(err);
    });
    ssh.on('end', function() {
      return callback(null, true);
    });
    return this.store['nikita:ssh:connection'] = void 0;
  }
};
