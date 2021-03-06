// Generated by CoffeeScript 2.1.1
// # `nikita.service(options, [callback])`

// Install, start/stop/restart and startup a service.

// The option "action" takes 3 possible values: "start", "stop" and "restart". A 
// service will only be restarted if it leads to a change of status. Set the value 
// to "['start', 'restart']" to ensure the service will be always started.

// ## Options

// * `action` (string)   
//   Execute the service with the provided action argument.
// * `cache`   
//   Run entirely from system cache to list installed and outdated packages.
// * `cacheonly` (boolean)   
//   Run the yum command entirely from system cache, don't update cache.
// * `chk_name` (string)   
//   Name used by the chkconfig utility, default to "srv_name" and "name".
// * `installed`   
//   Cache a list of installed services. If an object, the service will be
//   installed if a key of the same name exists; if anything else (default), no
//   caching will take place.
// * `name` (string)   
//   Package name, required unless provided as main argument.
// * `outdated`   
//   Cache a list of outdated services. If an object, the service will be updated
//   if a key of the same name exists; If true, the option will be converted to
//   an object with all the outdated service names as keys; if anything else
//   (default), no caching will take place.
// * `srv_name` (string)   
//   Name used by the service utility, default to "name".
// * `startup` (boolean|string)   
//   Run service daemon on startup. If true, startup will be set to '2345', use
//   an empty string to not define any run level.
// * `yum_name` (string)
//   Name used by the yum utility, default to "name".

// ## Callback parameters

// * `err`   
//   Error object if any.
// * `status`   
//   Indicate a change in service such as a change in installation, update,
//   start/stop or startup registration.
// * `installed`   
//   List of installed services.
// * `updates`   
//   List of services to update.

// ## Example

// ```js
// require('nikita').service([{
//   ssh: ssh,
//   name: 'ganglia-gmetad-3.5.0-99',
//   srv_name: 'gmetad',
//   action: 'stop',
//   startup: false
// },{
//   ssh: ssh,
//   name: 'ganglia-web-3.5.7-99'
// }], function(err, status){
//   console.log(err ? err.message : 'Service status: ' + !!status);
// });
// ```

// ## Source Code
var indexOf = [].indexOf;

module.exports = function(options) {
  var chkname, pkgname, srvname;
  options.log({
    message: "Entering service",
    level: 'DEBUG',
    module: 'nikita/lib/service'
  });
  if (typeof options.argument === 'string') {
    // Options
    if (options.name == null) {
      options.name = options.argument;
    }
  }
  pkgname = options.yum_name || options.name;
  chkname = options.chk_name || options.srv_name || options.name;
  srvname = options.srv_name || options.chk_name || options.name;
  if (typeof options.action === 'string') {
    options.action = options.action.split(',');
  }
  this.service.install({
    name: pkgname,
    cache: options.cache,
    cacheonly: options.cacheonly,
    if: pkgname, // option name and yum_name are optional, skill installation if not present
    installed: options.installed,
    outdated: options.outdated
  });
  this.service.startup({
    name: chkname,
    startup: options.startup,
    if: options.startup != null
  });
  return this.call({
    if: function() {
      return options.action;
    }
  }, function() {
    this.service.status({
      name: srvname,
      code_started: options.code_started,
      code_stopped: options.code_stopped,
      shy: true
    });
    this.service.start({
      name: srvname,
      if: function() {
        return !this.status(-1) && indexOf.call(options.action, 'start') >= 0;
      }
    });
    this.service.stop({
      name: srvname,
      if: function() {
        return this.status(-2) && indexOf.call(options.action, 'stop') >= 0;
      }
    });
    return this.service.restart({
      name: srvname,
      if: function() {
        return this.status(-3) && indexOf.call(options.action, 'restart') >= 0;
      }
    });
  });
};
