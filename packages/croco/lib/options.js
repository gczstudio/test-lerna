/** @format */

const path = require('path');
const metadata = require('read-metadata');
const exists = require('fs').existsSync;
const COMP_TYPE = 'comp';

/**
 * Read prompts metadata.
 *
 * @param {String} dir
 * @return {Object}
 */

module.exports = function options(name, dir, type) {
  const opts = require('./meta');
  opts.prompts = type === COMP_TYPE ? opts.compPrompt : opts.prompts;
  opts.prompts.framework && (opts.prompts.framework.default = type);
  setDefault(opts, 'name', name);
  return opts;
};

/**
 * Set the default value for a prompt question
 *
 * @param {Object} opts
 * @param {String} key
 * @param {String} val
 */

function setDefault(opts, key, val) {
  if (opts.schema) {
    opts.prompts = opts.schema;
    delete opts.schema;
  }
  const prompts = opts.prompts || (opts.prompts = {});
  if (!prompts[key] || typeof prompts[key] !== 'object') {
    prompts[key] = {
      type: 'string',
      default: val
    };
  } else {
    prompts[key]['default'] = val;
  }
}
