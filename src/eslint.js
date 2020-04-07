const eslint = require('eslint');

function eslintExec(files = ['.']) {
  const cli = new eslint.CLIEngine();
  const report = cli.executeOnFiles(files);
  const { results, errorCount, warningCount /*, fixableErrorCount, fixableWarningCount */ } = report;
  console.log(JSON.stringify(results, null, 2));

  return report;
}

module.exports = eslintExec;
