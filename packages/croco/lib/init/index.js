/**
 * cli init
 *
 * @format
 */

const inquirer = require('inquirer');
const path = require('path');
const ora = require('ora');
const home = require('user-home');
const rm = require('rimraf').sync;
const download = require('../download');
const logger = require('../logger');
const exists = require('fs').existsSync;
const generate = require('../generate');
const chalk = require('chalk');

async function run(info) {
  let templateName = info.template;
  if (!templateName) {
    //如果没有输入自定义模板名称，则选择
    const answers = await inquirer.prompt([
      {
        type: 'list',
        message: 'Which Project Type Do You Need:',
        name: 'type',
        choices: [
          {
            name: 'Web',
            value: 'web'
          },
          {
            name: 'App',
            value: 'app'
          },
          {
            name: 'Component',
            value: 'comp'
          }
        ]
      },
      {
        type: 'list',
        when: function(answer) {
          //判断是否是组件模板，目前组件模板只支持vue组件开发
          return answer.type !== 'comp';
        },
        message: 'Pick A JS Framework For Your Project',
        name: 'framework',
        choices: [
          {
            name: 'Vue.js',
            value: 'vue'
          },
          {
            name: ' Fly.js',
            value: 'flyjs'
          }
        ]
      }
    ]);

    templateName = answers.framework ? answers.framework : answers.type;
  }

  await downloadAndGenerate(templateName, {
    tmp: path.join(home, '.croco-templates-', templateName),
    ...info
  });
}

/**
 * Download a generate from a template repo.
 * @param {String} template
 */
async function downloadAndGenerate(tmpName, info) {
  const spinner = ora('Downloading template ...');
  spinner.start();

  // 如果本地存在模板则先删除
  if (exists(info.tmp)) rm(info.tmp);

  download(tmpName, info.tmp, err => {
    spinner.stop();
    if (err)
      logger.fatal(
        'Failed to download template repo ' +
          chalk.red('croco-template-' + tmpName) +
          ': ' +
          err.message.trim()
      );
    generate({
      name: info.name,
      src: info.tmp,
      dest: info.to,
      isCustom: info.isCustom,
      tmpName: tmpName
    }, err => {
      if (err) logger.fatal(err);
      console.log();
      logger.success('Generated "%s".', info.name);
    });
  });
}

/**
 * init
 * @param {string} rawName
 * @param {*} options
 */
async function init(rawName, options = {}) {
  const inPlace = !rawName || rawName === '.';
  const info = {
    to: path.resolve(rawName || '.'),
    name: inPlace ? path.relative('../', process.cwd()) : rawName,
    template: options.template, //自定义模版名称
    isCustom: options.template ? true : false //是否自定义模版
  };
  if (inPlace || exists(info.to)) {
    const isMakeDir = await inquirer.prompt([
      {
        type: 'confirm',
        message: inPlace
          ? 'Generate project in current directory?'
          : 'Target directory exists. Continue?',
        name: 'ok'
      }
    ]);
    if (isMakeDir.ok) await run(info);
  } else {
    await run(info);
  }
}

module.exports = (...args) => {
  return init(...args).catch(err => {
    logger.fatal(err);
  });
};
