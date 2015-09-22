var reportToGithub = require('./lib/handler');
var debug = require('debug')('strider-github-reporter');
var path = require('path');
var fs = require('fs');

var STRIDER_DATA_FOLDER = process.env.STRIDER_DATA_FOLDER || '/home/strider/.strider/data';

function jobReport(config, job) {
    debug('config....', config);
    config = config || {};
    var slug = job.project.name.replace('/', '-');
    var projectFolder = [slug, job._id].join('-');
    var PROJECT_FOLDER = path.resolve([ STRIDER_DATA_FOLDER, projectFolder ].join('/'));
    var ERROR_LOG = config.errorLog || 'unit-test-errors.log';
    var errorsLogPath = path.resolve(PROJECT_FOLDER, ERROR_LOG);

    if (job.errored || job.test_exitcode !== 0)
        return fs.readFileSync(errorsLogPath, 'utf-8');

    return 'All tests pass. Ready to merge.'
}

module.exports = {
  config: {
    ghReporter: {
      runnerLog: {
        type: String,
        default: 'unit-test-runner.log'
      },
      errorLog: {
        type: String,
        default: 'unit-test-errors.log'
      }
    }
  },
  // global events
  listen: function (io, context) {
    io.on('plugin.github-reporter.report', function (jobId, projectName, token, config, data) {
      var onDoneAndSaved = function (job) {
        if (job._id.toString() !== jobId.toString()) return
        debug('reporting to github', jobId, projectName, token, data)

        io.removeListener('job.doneAndSaved', onDoneAndSaved)
        var url = context.config.server_name + '/' + projectName + '/job/' + jobId;
        var report = jobReport(config, job);

        reportToGithub(token, url, data, report);
      }
      io.on('job.doneAndSaved', onDoneAndSaved)
    })
  }
};
