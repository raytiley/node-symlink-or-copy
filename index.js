var fs = require('fs');
var path = require('path');
var copyDereferenceSync = require('copy-dereference').sync

var isWindows = process.platform === 'win32';

var defaultOptions, testOptions, options = {
  copyDereferenceSync: copyDereferenceSync,
  canSymLink: testCanSymLink(),
  fs: fs
};

var spawn    = require('child_process').spawn;

function testCanSymLink () {
  var canLinkSrc  = path.join(__dirname, "canLinkSrc.tmp");
  var canLinkDest = path.join(__dirname, "canLinkDest.tmp");

  try {
    fs.writeFileSync(canLinkSrc);
  } catch (e) {
    return false;
  }

  try {
    fs.symlinkSync(canLinkSrc, canLinkDest);
  } catch (e) {
    fs.unlinkSync(canLinkSrc);
    return false;
  }

  fs.unlinkSync(canLinkDest);

  return true;
}


module.exports = symlinkOrCopy
function symlinkOrCopy () {
  throw new Error("This function does not exist. Use require('symlink-or-copy').sync")
}

module.exports.enableTestMode = enableTestMode
function enableTestMode() {
  options = testOptions;
}

module.exports.disableTestMode = disableTestMode
function disableTestMode() {
  options = defaultOptions;
}

module.exports.setTestOptions = setTestOptions
function setTestOptions(newTestOptions) {
  testOptions = newTestOptions;
}

module.exports.sync = symlinkOrCopySync
function symlinkOrCopySync (srcPath, destPath) {
  if (!options.canSymLink) {
    options.copyDereferenceSync(srcPath, destPath)
  } else {
    if (options.fs.lstatSync(srcPath).isSymbolicLink() || isWindows) {
      // We always want to use realPathSync() on windows since process.cwd() can
      // contain symlink components. See else if clause.

      // When we encounter symlinks, follow them. This prevents indirection
      // from growing out of control.
      // Note: At the moment `realpathSync` on Node is 70x slower than native,
      // because it doesn't use the standard library's `realpath`:
      // https://github.com/joyent/node/issues/7902
      // Can someone please send a patch to Node? :)
      srcPath = options.fs.realpathSync(srcPath)
    } else if (srcPath[0] !== '/') {
      // Resolve relative paths.
      // Note: On Mac and Linux (unlike Windows), process.cwd() never contains
      // symlink components, due to the way getcwd is implemented. As a
      // result, it's correct to use naive string concatenation in this code
      // path instead of the slower path.resolve(). (It seems unnecessary in
      // principle that path.resolve() is slower. Does anybody want to send a
      // patch to Node?)
      srcPath = process.cwd() + '/' + srcPath
    }

    options.fs.symlinkSync(srcPath, destPath)
  }
}
