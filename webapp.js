var reportToGithub = require('./lib/handler')
  , debug = require('debug')('strider-github-reporter')
  , path = require('path')
  , fs = require('fs');

var
    STRIDER_DATA_FOLDER = process.env.STRIDER_DATA_FOLDER || '/home/strider/.strider/data'
  , UNIT_TEST_RUNNER_LOG = process.env.UNIT_TEST_RUNNER_LOG || 'unit-test-runner.log'
  , UNIT_TEST_ERRORS_LOG = process.env.UNIT_TEST_ERRORS_LOG || 'unit-test-errors.log'
;

function jobReport(context, job) {
    debug('job', Object.keys(job));
    debug('job', Object.keys(job.ghReporter));
    debug('job', Object.keys(job.project));
    var slug = job.project.name.replace('/', '-');
    var projectFolder = [slug, job._id].join('-');
    var PROJECT_FOLDER = path.resolve([ STRIDER_DATA_FOLDER, projectFolder ].join('/'));
    var errorsLogPath = path.resolve(PROJECT_FOLDER, job.ghReporter.errorLog);

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
    io.on('plugin.github-reporter.report', function (jobId, projectName, token, data) {
      var onDoneAndSaved = function (job) {
        if (job._id.toString() !== jobId.toString()) return
        debug('reporting to github', jobId, projectName, token, data)

        io.removeListener('job.doneAndSaved', onDoneAndSaved)
        var url = context.config.server_name + '/' + projectName + '/job/' + jobId;
        var report = jobReport(context, job);

        reportToGithub(token, url, data, report);
      }
      io.on('job.doneAndSaved', onDoneAndSaved)
    })
  }
};
