var debug = require('debug')('strider-github-reporter')

module.exports = {
  init: function (config, job, context, callback) {
    debug('initing', job._id, job.plugin_data)
    if (!job.plugin_data || !job.plugin_data.github || !job.plugin_data.github.pull_request) {
      debug('No github PR data', job.plugin_data, job)
      return callback(null, {})
    } else {
      debug('found pr!', job.plugin_data.github.pull_request)
    }
    var projectName = job.project.name
      , creator = job.project.creator
      , account
      , token
    account = creator.account(job.project.provider)
    if (!account || !account.config.accessToken) {
      console.error('Account not found for', job.project.provider)
      debug(job.project.provider, creator.accounts, account)
      return
    }
    token = account.config.accessToken
    debug('Token', account, token)

    return callback(null, {
      listen: function (emitter) {
        debug('listening')
				debug('prdata', job.plugin_data.github.pull_request);
        var github_repo_data = {
          user: job.project.provider.config.owner,
          repo: job.project.provider.config.repo,
          sha: job.plugin_data.github.pull_request.sha,
					number: job.plugin_data.github.pull_request.number
        }
        emitter.once('job.status.tested', function (jobId) {
          debug('reporting status', jobId)
          emitter.emit('plugin.github-reporter.report', jobId, projectName, token, github_repo_data)
        })
      }
    })
  }
}
