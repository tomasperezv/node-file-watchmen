/**
 * Scan through text for data that may be of interest.
 *
 * @see https://github.com/loadfive/Knwl.js
 */
module.exports = {
  /**
   * @param {String} filePath 
   * @param {Log} log
   */
  check: function(filename, log) {

    var Knwl = require('../external/knwl/node-knwl');
    var fs = require('fs');
    var data = fs.readFileSync(filename, 'utf8');

    var textAnalysis = new Knwl();
    textAnalysis.init(data);

    log.ok('Applying knwl to ' + filename);

    log.info('--dates', textAnalysis.get('dates'));
    log.info('--times', textAnalysis.get('times'));
    log.info('--links', textAnalysis.get('links'));
    log.info('--emails', textAnalysis.get('emails'));
    log.info('--phones', textAnalysis.get('phones'));
    log.info('--readingTime', textAnalysis.get('readingTime'));
    log.info('--emotion', textAnalysis.get('emotion'));
    log.info('--spam', textAnalysis.get('spam'));

  }
};
