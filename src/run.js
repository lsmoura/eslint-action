const eslint = require('./eslint');
const request = require('./request');

const { GITHUB_SHA, GITHUB_TOKEN, GITHUB_EVENT_PATH } = process.env;
const event = require(GITHUB_EVENT_PATH);

const CHECK_NAME = 'eslint';
const OWNER = event.repository.owner.login;
const REPO = event.repository.name;

if (!GITHUB_TOKEN) {
  throw new Error('required environment variable not found: GITHUB_TOKEN');
}

const githubCheckUrl = (extra) => `https://api.github.com/repos/${OWNER}/${REPO}/check-runs${extra !== undefined ? extra : ''}`;

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

  return request(githubCheckUrl(), {
    method: 'POST',
    headers,
    body
  }).then(response => response.data);
}

function updateCheck(id, conclusion, output) {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/vnd.github.antiope-preview+json',
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    'User-Agent': 'eslint-action',
  };

  const body = {
    name: CHECK_NAME,
    head_sha: GITHUB_SHA,
    status: 'completed',
    completed_at: new Date(),
    conclusion,
    output
  };

  return request(githubCheckUrl(`/${id}`), {
    method: 'PATCH',
    headers,
    body
  });
}

async function run() {
  const checkResponse = await createCheck();
  console.log(checkResponse);
  const lintResponse = eslint();

  const conclusion = 'success';
  const output = {
    title: CHECK_NAME,
    summary: 'all good',
    annotations: [],
  };
  await updateCheck(checkResponse.id, conclusion, output);

  console.log('done');
}

run().catch(err => {
  console.error(err);
  console.trace();
});
