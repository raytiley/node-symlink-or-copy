var assert = require('assert');

var symLinkOrCopy = require('..')


describe('node-symlink-or-copy', function() {
  beforeEach(function() {
    symLinkOrCopy.disableTestMode();
  });

	it('windows falls back to copy', function() {
    var count = 0;
  	symLinkOrCopy.setTestOptions({
      copyDereferenceSync: function() {
        count++;
      },
      canSymLink: false
    });
    symLinkOrCopy.enableTestMode();
    symLinkOrCopy.sync();
    assert.equal(count, 1);
  });

  it('windows symlinks when has permission', function() {
    var count = 0;
    symLinkOrCopy.setTestOptions({
      fs: {
        lstatSync: function() {
          return {
            isSymbolicLink: function() {
              count++;
              return true;
            }
          }
        },
        realpathSync: function() {count++},
        symlinkSync: function() {count++;}
      },
      canSymLink: true
    });
    symLinkOrCopy.enableTestMode();
    symLinkOrCopy.sync();
    assert.equal(count, 3);
  })
});

describe('testing mode', function() {
    
    it('allows fs to be mocked', function() {
      var count = 0;
      symLinkOrCopy.setTestOptions({
        canSymLink: true,
        fs: {
          lstatSync: function() {
            return {
              isSymbolicLink: function() {
                count++;
                return true;
              }
            }
          },
          realpathSync: function() {count++},
          symlinkSync: function() {count++;}
        }
      });
      symLinkOrCopy.enableTestMode();

      assert.equal(count, 0);
      symLinkOrCopy.sync();
      assert.equal(count, 3);
    });
  });