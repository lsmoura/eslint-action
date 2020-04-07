const eslint = require('./eslint');
const request = require('./request');

const { GITHUB_SHA, GITHUB_TOKEN, GITHUB_EVENT_PATH, GITHUB_WORKSPACE } = process.env;
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

function parseEslintResponse(response) {
  const levels = ['', 'warning', 'failure'];

  const annotations = [];
  response.forEach((({ filePath, messages }) => {
    const path = filePath.substring(GITHUB_WORKSPACE.length + 1);
    messages.forEach(({ line, severity, ruleId, message }) => {
      const annotationSeverity = levels[severity];

      annotations.push({
        path,
        start_line: line,
        end_line: line,
        annotation_level: annotationSeverity,
        message: `[${ruleId}] ${message}`,
      });
    });
  }));

  return annotations;
}

function submitResult(id, { results, errorCount, warningCount }) {
  const annotations = parseEslintResponse(results);
  const conclusion = errorCount <= 0 ? 'success' : 'failure';
  const output = {
    title: CHECK_NAME,
    summary: `${errorCount} error${errorCount > 1 ? 's' : ''}, ${warningCount} warning${warningCount > 1 ? 's' : ''} found`,
    annotations,
  };
  return updateCheck(id, conclusion, output);
}

async function run() {
  const checkResponse = await createCheck();
  const lintResponse = eslint();
  await submitResult(checkResponse.id, lintResponse);

  console.log('done');
}

run().catch(err => {
  console.error(err);
  console.trace();
});
