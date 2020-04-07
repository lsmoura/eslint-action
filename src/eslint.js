const eslint = require('eslint')

const levels = ['', 'warning', 'failure']

function eslintExec() {
  const cli = new eslint.CLIEngine();
  const report = cli.executeOnFiles(['.']);
  const { results, errorCount, warningCount /*, fixableErrorCount, fixableWarningCount */ } = report;

  console.log(results);
}

module.exports = eslintExec;