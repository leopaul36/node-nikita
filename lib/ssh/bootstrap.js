// Generated by CoffeeScript 1.11.1
module.exports = {
  shy: true,
  handler: function(options) {
    options.log({
      message: "Entering ssh.bootstrap",
      level: 'DEBUG',
      module: 'mecano/lib/ssh/bootstrap'
    });
    if (options.host == null) {
      options.host = options.ip;
    }
    if (options.cmd == null) {
      options.cmd = 'su -';
    }
    if (options.username == null) {
      options.username = null;
    }
    if (options.password == null) {
      options.password = null;
    }
    return options.retry = 3;
  }
};