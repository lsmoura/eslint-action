const eslint = require('./eslint');
const check = require('./github_check');

const { GITHUB_TOKEN, GITHUB_WORKSPACE, GITHUB_ACTION } = process.env;

const CHECK_NAME = GITHUB_ACTION || 'eslint';

if (!GITHUB_TOKEN) {
  throw new Error('required environment variable not found: GITHUB_TOKEN');
}

function applyFix(source, fix) {
  if (!fix) return source;
  return source.substr(0, fix.range[0]) + ';' + source.substr(fix.range[1]);
}

function suggestionBlock(message) {
  const pieces = ['', '', '```suggestion', message, '```', ''];
  return pieces.join('\n');
}

function parseEslintResponse(response) {
  const levels = ['', 'warning', 'failure'];

  const annotations = [];
  response.forEach((({ filePath, messages, source }) => {
    const path = filePath.substring(GITHUB_WORKSPACE.length + 1);
    messages.forEach(({ line, severity, ruleId, message, fix }) => {
      const annotationSeverity = levels[severity];

      let annotationMessage = `[${ruleId}]: ${message}`;

      if (fix) {
        const suggestionFix = applyFix(source, fix);
        const lines = suggestionFix.split('\n');
        const effectLine = lines[line - 1];
        annotationMessage += suggestionBlock(effectLine);
      }

      annotations.push({
        path,
        start_line: line,
        end_line: line,
        annotation_level: annotationSeverity,
        message: annotationMessage,
      });
    });
  }));

  return annotations;
}

function submitResult(githubCheck, { results, errorCount, warningCount }) {
  const annotations = parseEslintResponse(results);
  const conclusion = errorCount <= 0 ? 'success' : 'failure';
  const output = {
    summary: `${errorCount} error${errorCount > 1 ? 's' : ''}, ${warningCount} warning${warningCount > 1 ? 's' : ''} found`,
    annotations,
  };
  return githubCheck.update(conclusion, output).then(() => conclusion === 'success');
}

async function run() {
  const githubCheck = new check(GITHUB_TOKEN, CHECK_NAME);
  await githubCheck.create();
  const lintResponse = eslint();
  const result = await submitResult(githubCheck, lintResponse);

  if (!result) process.exit(78);
}

run().catch(err => {
  console.error(err);
  console.trace();
  process.exit(1);
});
