const request = require('./request');
const { GITHUB_SHA, GITHUB_EVENT_PATH } = process.env;
const event = require(GITHUB_EVENT_PATH);

const OWNER = event.repository.owner.login;
const REPO = event.repository.name;

const githubCheckUrl = (extra) => `https://api.github.com/repos/${OWNER}/${REPO}/check-runs${extra !== undefined ? extra : ''}`;

function Check(token, checkName) {
  if (!token) {
    throw new Error('cannot create github check: no token');
  }
  this.headers = {
    'Content-Type': 'application/json',
    Accept: 'application/vnd.github.antiope-preview+json',
    Authorization: `Bearer ${token}`,
    'User-Agent': 'eslint-action',
  };

  this.id = null;
  this.checkName = checkName || 'generic-action';

  return this;
}

Check.prototype.create = function (title) {
  if (this.id !== null) {
    throw new Error('check already created');
  }

  const body = {
    name: this.checkName,
    head_sha: GITHUB_SHA,
    status: 'in_progress',
    started_at: new Date(),
    output: {
      title: this.checkName,
      summary: '',
      text: '',
    },
  };

  return request(githubCheckUrl(), {
    method: 'POST',
    headers: this.headers,
    body,
  }).then(response => {
    this.id = response.data.id;
    return response.data;
  });
};

Check.prototype.update = function(conclusion, originalOutput) {
  const output = Object.assign({}, originalOutput);
  if (!output.title) output.title = this.checkName;
  const body = {
    name: this.checkName,
    head_sha: GITHUB_SHA,
    status: 'completed',
    completed_at: new Date(),
    conclusion,
    output,
  };

  return request(githubCheckUrl(`/${this.id}`), {
    method: 'PATCH',
    headers: this.headers,
    body,
  });
};

module.exports = Check;
