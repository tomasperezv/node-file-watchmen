/**
 * Action performed whenever a JSON file is modified.
 *
 * It will parse it and show an error message in the console if
 * the content is not JSON valid.
 */
module.exports = {
  /**
   * @param {String} filePath 
   * @param {Log} log
   */
  check: function(filename, log) {
    var fs = require('fs');
    try {
		  var data = JSON.parse(fs.readFileSync(filename, 'utf8'));
      log.ok(filename + ' syntax correct.');
    } catch(e) {
      log.error(filename + ': ' + e.message);
    }
  }
};
