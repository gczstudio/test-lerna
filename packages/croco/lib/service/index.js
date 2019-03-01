/** @format */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const Service = require('@croco/cli-service');
const { findExisting } = require('../util');
const context = process.cwd();
const pkg = fs.existsSync(path.resolve(context, 'package.json'))
  ? require(path.resolve(context, 'package.json'))
  : {};

function resolveEntry(entry) {
  // const context = process.cwd();

  entry =
    entry ||
    findExisting(context, [
      './src/main.js',
      './src/index.js',
      './src/App.vue',
      './src/app.vue'
    ]);

  if (pkg.spaMode || typeof pkg.spaMode === 'undefined') {
    if (!entry) {
      console.log(
        chalk.red(`Failed to locate entry file in ${chalk.yellow(context)}.`)
      );
      console.log(
        chalk.red(
          `Valid entry file should be one of: main.js, index.js, App.vue or app.vue.`
        )
      );
      process.exit(1);
    }

    if (!fs.existsSync(path.join(context, entry))) {
      console.log(
        chalk.red(`Entry file ${chalk.yellow(entry)} does not exist.`)
      );
      process.exit(1);
    }
  }

  return {
    context,
    entry
  };
}

function createService(context, entry, asLib) {
  return new Service(context, {
    projectOptions: {
      compiler: true,
      lintOnSave: true
    },
    plugins: [],
    entry: entry
  });
}

exports.serve = (_entry, args) => {
  const { context, entry } = resolveEntry(_entry);
  createService(context, entry).run('serve', args);
};

exports.build = (_entry, args) => {
  const { context, entry } = resolveEntry(_entry);
  const asLib = args.target && args.target !== 'app';
  if (asLib) {
    args.entry = entry;
  }
  createService(context, entry, asLib).run('build', args);
};
