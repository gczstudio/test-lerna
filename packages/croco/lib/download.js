/** @format */

var downloadUrl = require('download');

/**
 * Expose `download`.
 */

module.exports = download;

/**
 * Download `repo` to `dest` and callback `fn(err)`.
 *
 * @param {String} type
 * @param {String} dest
 * @param {Function} fn
 */

function download(name, dest, fn) {
  var url = `https://github.com/gczstudio/croco-template-${name}/archive/master.zip`;
  downloadUrl(url, dest, {
    extract: true,
    strip: 1,
    mode: '666',
    headers: { accept: 'application/zip' }
  })
    .then(data => {
      fn();
    })
    .catch(err => {
      fn(err);
    });
}
