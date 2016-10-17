const test = require('ava');
const sinon = require('sinon');
const os = require('os');
const constants = require('../../utils/constants');
const proxyquire = require('proxyquire').noPreserveCache();

const getUninstallHandler = ({ writeFile, unlink } = {}) => {
  return proxyquire.load('../../actions/uninstall', {
    fs: {
      writeFile,
      unlink
    }
  });
};

test('verifyInstalled -> not installed -> throws an error', (t) => {
  const uninstallHandler = getUninstallHandler();

  t.throws(() => uninstallHandler.verifyInstalled('HOOK'));
});

test('verifyInstalled -> installed -> returns the starting index of the script and the post checkout', (t) => {
  const precontent = 'PRE CONTENT';
  const postcontent = 'POST CONTENT';
  const uninstallHandler = getUninstallHandler();
  const value = uninstallHandler.verifyInstalled(`${precontent}${constants.beginningInstallMessage}${postcontent}`);

  t.is(value.beginningMessageIndex, precontent.length);
});

test(`uninstall -> there's content other than git-latest in the hook -> writes the content before and after the git-latest hook`, (t) => {
  const precontent = 'PRE CONTENT' + os.EOL;
  const postcontent = os.EOL + 'POST CONTENT';
  const postCheckout = `${precontent}${constants.beginningInstallMessage}CONTENT${constants.endingInstallMessage}${postcontent}`;
  const writeFile = sinon.stub().callsArgWith(3, undefined, true);

  return getUninstallHandler({ writeFile }).uninstall({ beginningMessageIndex: precontent.length, postCheckout }).then(() => {
    t.is(writeFile.calledWith(constants.postCheckoutPath, precontent + postcontent, { mode: 0o777 }), true);
  });
});

test(`uninstall -> there's only git-latest in the hook -> remove the post-checkout hook file`, (t) => {
  const precontent = constants.nodeShebang;
  const postCheckout = `${precontent}${constants.beginningInstallMessage}CONTENT${constants.endingInstallMessage}`;
  const unlink = sinon.stub().callsArgWith(1, undefined, true);

  return getUninstallHandler({ unlink }).uninstall({ beginningMessageIndex: precontent.length, postCheckout }).then(() => {
    t.is(unlink.calledWith(constants.postCheckoutPath), true);
  });
});