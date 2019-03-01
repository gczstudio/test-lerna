/** @format */

const path = require('path');
const fs = require('fs');
const { proPrompt, compPrompt } = require('./prompts');

const {
  sortDependencies,
  installDependencies,
  runLintFix,
  printMessage
} = require('./utils');

const templateVersion = '1.0.1';

module.exports = {
  helpers: {
    if_or(v1, v2, options) {
      if (v1 || v2) {
        return options.fn(this);
      }

      return options.inverse(this);
    },
    template_version() {
      return templateVersion;
    }
  },
  prompts: proPrompt,
  compPrompt: compPrompt,
  filters: {
    'spa/**/**/*': 'spa',
    'mpa/**/**/*': '!spa',
    '{spa,mpa}/build/*': 'build',
    '{spa,mpa}/config/*': 'build',
    '**/src/store/**/*': 'vuex'
    // 'package.bak.json': 'false',
    // '.eslintrc': 'lint',
    // '.eslintignore': 'false'
    // '.babelrc': 'framework == "vue"',
    // 'config/test.env.js': 'unit || e2e',
    // 'build/webpack.test.conf.js': "unit && runner === 'karma'",
    // 'test/unit/**/*': 'unit',
    // 'test/unit/index.js': "unit && runner === 'karma'",
    // 'test/unit/jest.conf.js': "unit && runner === 'jest'",
    // 'test/unit/karma.conf.js': "unit && runner === 'karma'",
    // 'test/unit/specs/index.js': "unit && runner === 'karma'",
    // 'test/unit/setup.js': "unit && runner === 'jest'",
    // 'test/e2e/**/*': 'e2e',
    // 'src/router/**/*': 'router',
  },
  skipInterpolation: ['spa/**/**/*', 'mpa/**/**/*'],
  complete: function(data, { chalk }) {
    const green = chalk.green;

    sortDependencies(data, green);

    const cwd = path.join(process.cwd(), data.inPlace ? '' : data.destDirName);

    if (data.autoInstall) {
      installDependencies(cwd, data.autoInstall, green)
        .then(() => {
          return runLintFix(cwd, data, green);
        })
        .then(() => {
          printMessage(data, green);
        })
        .catch(e => {
          console.log(chalk.red('Error:'), e);
        });
    } else {
      printMessage(data, chalk);
    }
  }
};
