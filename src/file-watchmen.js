var fs = require('fs');
var log = require('./node-log/src/log');
var config = require('./node-config/config').get('directories');

for (var folder in config) {
  if (config.hasOwnProperty(folder)) {
    log.info('Watching folder ' + folder);
    watchFolder(folder, config[folder]);
  }
}

/**
 * @method watchFolder
 * @param {String} folder 
 * @param {Object} config
 */
function watchFolder(folder, config) {

  fs.stat(folder, function(err, stats) {

    if (err) {
      log.error('Error reading ' + folder);
      return;
    }

    if (stats.isFile()) {
      watchFile(folder, config);
    } else if (stats.isDirectory()) {
      fs.readdir(folder, function(err, files) {

        if (err) {
          log.error('Error reading ' + folder);
          return;
        }

        for (var i = 0; i < files.length; i++) {
          listenToChanges(folder, files[i], config);
        }

      });
    }

  });



};


/**
 * @param {String} folder 
 * @param {String} file
 * @param {Object} config
 * @method listenToChanges
 */
var listenToChanges = function(folder, file, config) {

  var filePath = folder + '/' + file;

  fs.stat(filePath, function(err, stats) {

    if (err) {
      log.error('Error listening to changes on ' + folder);
      return;
    }

    if (stats.isFile()) {
      watchFile(filePath, config);
    } else if (stats.isDirectory()) {
      watchFolder(filePath, config);
    }

  });

};

/**
 * @param {String} filePath
 * @param {Object} config
 * @return {Boolean}
 * @method isValid
 */
function isValid(filePath, config) {
  var fileExtension = getFileExtension(filePath);
  return (fileExtension !== '' &&
      typeof config[fileExtension] !== 'undefined' &&
      !isHidden(filePath));
}

/**
 * @method getFileExtension
 * @param {String} filePath
 * @return {String}
 */
function getFileExtension(filePath) {
  return filePath.split('.').length > 1 ? filePath.split('.').pop() : '';
}

/**
 * @method isHidden
 * @param {String} filePath
 * @return {Boolean}
 */
function isHidden(filePath) {
  return (/(^|.\/)\.+[^\/\.]/g).test(filePath);
}

/**
 * @param {Action} action
 * @param {String} filePath
 * @param {Log} log
 * @method applyAction
 * @return void
 */
function applyAction(action, filePath, fileExtension, log) {
  action.check(filePath, log);
}

/**
 * @param {String} filePath
 * @method watchFile
 */
function watchFile(filePath, config) {

  if (!isValid(filePath, config)) {
    if (!isHidden(filePath)) {
      log.warning('Ignoring ' + filePath);
    }
    return;
  }

  log.ok('Watching file ' + filePath);

  fs.watchFile(filePath, function(curr, prev) {

    var fileExtension = getFileExtension(filePath);
    var actionConfig = config[fileExtension];

    if (Object.prototype.toString.call(actionConfig) === '[object Array]') {
      actionConfig.map(function(current) {
        log.info('Detected change in ' + filePath + ', applying ' + current );
        var action = require(current);
        applyAction(action, filePath, fileExtension, log);
      });
    } else {
      log.info('Detected change in ' + filePath + ', applying ' + config[fileExtension] );
      var action = require(config[fileExtension]);
      applyAction(action, filePath, fileExtension, log);
    }

  });

};
