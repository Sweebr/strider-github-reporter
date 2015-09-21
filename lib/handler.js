var url = require('url');
var GithubApi = require('github');
var debug = require('debug')('strider-github-reporter');
var path = require('path');

var GITHUB_DOMAIN = process.env.PLUGIN_GITHUB_API_DOMAIN;
var GITHUB_API_ENDPOINT = process.env.PLUGIN_GITHUB_API_ENDPOINT;

var config = {
  version: '3.0.0'
};

if (GITHUB_DOMAIN) {
  config.host = url.parse(GITHUB_DOMAIN).host;
}

if (GITHUB_API_ENDPOINT) {
  config.pathPrefix = url.parse(GITHUB_API_ENDPOINT).path;
}

module.exports = function (token, url, data, report) {
  debug('Sending report to github', token, url, data, report)
  var github = new GithubApi(config);
  github.authenticate({
    type: 'oauth',
    token: token
  })
  github.issues.createComment({
      tager_url: url,
      user: data.user,
      repo: data.repo,
      number: data.number,
      body: report
  }, function (err, res) {
      if (err) return console.error('failed to post comment on pr', url, data, report, err.message);
      debug('report successfully sent', res, url, data, report);
  });
}
