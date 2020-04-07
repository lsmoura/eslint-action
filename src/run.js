const eslint = require('./eslint');
const request = require('./request');

const { GITHUB_SHA, GITHUB_TOKEN, GITHUB_EVENT_PATH } = process.env;
const event = require(GITHUB_EVENT_PATH);

const CHECK_NAME = 'eslint';
const OWNER = event.repository.owner.login;
const REPO = event.repository.name;

function createCheck() {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/vnd.github.antiope-preview+json',
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    'User-Agent': 'eslint-action',
  };

  const body = {
    name: CHECK_NAME,
    head_sha: GITHUB_SHA,
    status: 'in_progress',
    started_at: new Date(),
  };

  return request(`https://api.github.com/repos/${OWNER}/${REPO}/check-runs`, {
    method: 'POST',
    headers,
    body
  }).then(response => response.data);
}


async function run() {
  const checkResponse = await createCheck();
  console.log(checkResponse);
  eslint();
}

run();
