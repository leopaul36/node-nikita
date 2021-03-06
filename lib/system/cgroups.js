// Generated by CoffeeScript 2.1.1
  // # `nikita.system.cgroups(options, [callback])`

  // Nikita action to manipulate cgroups. [cgconfig.conf(5)] describes the 
  // configuration file used by libcgroup to define control groups, their parameters 
  // and also mount points.. The configuration file is identitcal on ubuntu, redhat 
  // and centos.

  // ## Options

  // * `default` (object)   
  //   The default object of cgconfig file.   
  // * `groups` (dictionnary)   
  //   Object of cgroups to add to cgconfig file.   
  // * `ignore` (array|string)   
  //   List of group path to ignore. Only used when merging.   
  // * `mounts` (array)   
  //   List of mount object to add to cgconfig file.   
  // * `merge` (boolean).   
  //   Default to true. Read the config from cgsnapshot command and merge mounts part
  //   of the cgroups.   
  // * `target` (string).   
  //   The cgconfig configuration file. By default nikita detects provider based on 
  //   os.   

  // The groups object is a dictionnary containing as the key the cgroup name, and 
  // as a value the cgroup content. The content should contain the following 
  // properties.

  // * `perm` (object)   
  //   Object to describe the permission of the owner and the task file.   
  // * `controllers` (dictionary)   
  //   Object of controller in the cgroup. Controllers can fe of the following 
  //   type. The key is the name of the controler, and the content are the value 
  //   of the controller. The controller's name can be of one of 
  //   (cpuset|cpu|cpuacct|memory|devices|freezer|net_cls|blkio.   

  // It accepts also all the `nikita.file` options.

  // Example:

  // Example of a group object

  // ```cson
  // bibi:
  //   perm:
  //     admin:
  //       uid: 'bibi'
  //       gid: 'bibi'
  //     task:
  //       uid: 'bibi'
  //       gid: 'bibi'
  //   controllers:
  //     cpu:
  //       'cpu.rt_period_us': '"1000000"'
  //       'cpu.rt_runtime_us': '"0"'
  //       'cpu.cfs_period_us': '"100000"'
  // ```

  // Which will result in a file:

  // ```text
  // group bibi {
  //   perm {
  //     admin {
  //       uid = bibi;
  //       gid = bibi;
  //     }
  //     task {
  //       uid = bibi;
  //       gid = bibi;
  //     }
  //   }
  //   cpu {
  //     cpu.rt_period_us = "1000000";
  //     cpu.rt_runtime_us = "0";
  //     cpu.cfs_period_us = "100000";
  //   }
  // }
  // ```

  // ## Source Code

  // When reading the current config, nikita uses cgsnaphsot command in order to 
  // have a well formatted file. Nonetheless if docker is installed and started, 
  // informations about live containers could be printed, that's why all path under 
  // docker/* are ignored.
var merge, misc, path, string,
  indexOf = [].indexOf;

module.exports = function(options, callback) {
  options.log({
    message: "Entering cgroups",
    level: 'DEBUG',
    module: 'nikita/lib/system/cgroups'
  });
  if (!((options.groups != null) || (options.mounts != null) || (options.default != null))) {
    throw Error('Missing cgroups content');
  }
  if (options.mounts == null) {
    options.mounts = [];
  }
  if (options.groups == null) {
    options.groups = {};
  }
  if (options.merge == null) {
    options.merge = true;
  }
  options.cgconfig = {};
  options.cgconfig['mounts'] = options.mounts;
  options.cgconfig['groups'] = options.groups;
  if (options.default != null) {
    options.cgconfig['groups'][''] = options.default;
  }
  if (options.ignore == null) {
    options.ignore = [];
  }
  if (!Array.isArray(options.ignore)) {
    options.ignore = [options.ignore];
  }
  // Detect Os and version
  this.system.execute({
    unless: function() {
      return (this.store['nikita:system:type'] != null) && (this.store['nikita:system:release'] != null);
    },
    shy: true,
    cmd: 'cat /etc/system-release',
    code_skipped: 1
  }, function(err, status, stdout, stderr) {
    var base, base1, base2, base3, index, line;
    if (!status) {
      return;
    }
    [line] = string.lines(stdout);
    if (/CentOS/.test(line)) {
      if ((base = this.store)['nikita:system:type'] == null) {
        base['nikita:system:type'] = 'centos';
      }
      index = line.split(' ').indexOf('release');
      if ((base1 = this.store)['nikita:system:release'] == null) {
        base1['nikita:system:release'] = line.split(' ')[index + 1];
      }
    }
    if (/Red\sHat/.test(line)) {
      if ((base2 = this.store)['nikita:system:type'] == null) {
        base2['nikita:system:type'] = 'redhat';
      }
      index = line.split(' ').indexOf('release');
      if ((base3 = this.store)['nikita:system:release'] == null) {
        base3['nikita:system:release'] = line.split(' ')[index + 1];
      }
    }
    if (this.store['nikita:system:type'] == null) {
      throw Error('Unsupported OS');
    }
  });
  // configure parameters based on previous OS dection
  this.call({
    shy: true,
    if: function() {
      var ref;
      return (ref = this.store['nikita:system:type']) === 'redhat' || ref === 'centos';
    }
  }, function() {
    return this.system.execute({
      cmd: 'cgsnapshot -s 2>&1'
    }, function(err, status, stdout, stderr) {
      var base, base1, base2, base3, cgconfig, cpu_path, cpuaccts, cpus, group, groups, name, ref;
      if (err) {
        throw err;
      }
      cgconfig = misc.cgconfig.parse(stdout);
      if (cgconfig.mounts == null) {
        cgconfig.mounts = [];
      }
      cpus = cgconfig.mounts.filter(function(mount) {
        if (mount.type === 'cpu') {
          return mount;
        }
      });
      cpuaccts = cgconfig.mounts.filter(function(mount) {
        if (mount.type === 'cpuacct') {
          return mount;
        }
      });
      // We choose a path which is mounted by default
      if (this.store['nikita:cgroups:cpu_path'] == null) {
        if (cpus.length > 0) {
          cpu_path = cpus[0]['path'].split(',')[0];
          if ((base = this.store)['nikita:cgroups:cpu_path'] == null) {
            base['nikita:cgroups:cpu_path'] = cpu_path;
          }
        } else {
          // a arbitrary path is given based on the
          switch (this.store['nikita:system:type']) {
            case 'redhat':
              if (this.store['nikita:system:release'][0] === '6') {
                if ((base1 = this.store)['nikita:cgroups:cpu_path'] == null) {
                  base1['nikita:cgroups:cpu_path'] = '/cgroups/cpu';
                }
              }
              if (this.store['nikita:system:release'][0] === '7') {
                if ((base2 = this.store)['nikita:cgroups:cpu_path'] == null) {
                  base2['nikita:cgroups:cpu_path'] = '/sys/fs/cgroup/cpu';
                }
              }
              break;
            default:
              throw Error(`Nikita does not support cgroups on your OS ${this.store['nikita:system:type']}`);
          }
        }
      }
      if (this.store['nikita:cgroups:mount'] == null) {
        if ((base3 = this.store)['nikita:cgroups:mount'] == null) {
          base3['nikita:cgroups:mount'] = `${path.dirname(this.store['nikita:cgroups:cpu_path'])}`;
        }
      }
      // Running docker containers are remove from cgsnapshot output
      if (options.merge) {
        groups = {};
        ref = cgconfig.groups;
        for (name in ref) {
          group = ref[name];
          if (!((name.indexOf('docker/') !== -1) || (indexOf.call(options.ignore, name) >= 0))) {
            groups[name] = group;
          }
        }
        options.cgconfig.groups = merge(groups, options.groups);
        return options.cgconfig.mounts.push(...cgconfig.mounts);
      }
    });
  });
  this.call(function() {
    if (this.store['nikita:system:type'] === 'redhat') {
      if (options.target == null) {
        options.target = '/etc/cgconfig.conf';
      }
    }
    return this.file(options, {
      content: misc.cgconfig.stringify(options.cgconfig)
    });
  });
  return this.next(function(err, status) {
    return callback(err, status, {
      cpu_path: this.store['nikita:cgroups:cpu_path'],
      mount: this.store['nikita:cgroups:mount']
    });
  });
};


// ## Dependencies
misc = require('../misc');

string = require('../misc/string');

({merge} = misc);

path = require('path');

// [cgconfig.conf(5)]: https://linux.die.net/man/5/cgconfig.conf
