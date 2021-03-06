// Generated by CoffeeScript 2.1.1
// # `nikita.db.user.exists(options, callback)`

// Check if a user exists in the database.

// ## Options

// * `admin_username`   
//   The login of the database administrator. It should have credentials to 
//   create accounts.   
// * `admin_password`   
//   The password of the database administrator.   
// * `database` (String)   
//   The database name to which the user should be added.   
// * `engine`   
//   The engine type, can be MySQL or PostgreSQL, default to MySQL.   
// * `host`   
//   The hostname of the database.   
// * `username`   
//   The new user name.   
// * `password`   
//   The new user password.   
// * `port`   
//   Port to the associated database.   
// * `user` (String)   
//   User name.   

// ## Source Code
var db;

module.exports = {
  shy: true,
  handler: function(options) {
    var cmd, k, ref, ref1, v;
    // Import options from `options.db`
    if (options.db == null) {
      options.db = {};
    }
    ref = options.db;
    for (k in ref) {
      v = ref[k];
      if (options[k] == null) {
        options[k] = v;
      }
    }
    if (!options.host) {
      // Check main options
      throw Error('Missing option: "hostname"');
    }
    if (!options.admin_username) {
      throw Error('Missing option: "admin_username"');
    }
    if (!options.admin_password) {
      throw Error('Missing option: "admin_password"');
    }
    if (!options.username) {
      throw Error('Missing option: "username"');
    }
    if (!options.engine) {
      throw Error('Missing option: "engine"');
    }
    // Deprecation
    if (options.engine === 'postgres') {
      console.log('Deprecated Value: options "postgres" is deprecated in favor of "postgresql"');
      options.engine = 'postgresql';
    }
    // Defines and check the engine type
    options.engine = options.engine.toLowerCase();
    if ((ref1 = options.engine) !== 'mariadb' && ref1 !== 'mysql' && ref1 !== 'postgresql') {
      throw Error(`Unsupport engine: ${JSON.stringify(options.engine)}`);
    }
    // Defines port
    if (options.port == null) {
      options.port = 5432;
    }
    cmd = (function() {
      switch (options.engine) {
        case 'mariadb':
        case 'mysql':
          return db.cmd(options, {
            database: 'mysql'
          }, `select User from user where User = '${options.username}'`) + ` | grep '${options.username}'`;
        case 'postgresql':
          // Not sure why we're not using du
          return db.cmd(options, `SELECT 1 FROM pg_roles WHERE rolname='${options.username}'`) + " | grep 1";
      }
    })();
    return this.system.execute({
      cmd: cmd,
      code_skipped: 1
    });
  }
};

// ## Dependencies
db = require('../../misc/db');
