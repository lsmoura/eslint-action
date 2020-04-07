const eslint = require('eslint');

const levels = ['', 'warning', 'failure'];

function eslintExec() {
  const cli = new eslint.CLIEngine();
  const report = cli.executeOnFiles(['.']);
  const { results, errorCount, warningCount /*, fixableErrorCount, fixableWarningCount */ } = report;

  console.log(JSON.stringify(results, null, 2));

  return results;
}

module.exports = eslintExec;
