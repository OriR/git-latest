const test = require('ava');
const os = require('os');
const sinon = require('sinon');
const constants = require('../../utils/constants');
const proxyquire = require('proxyquire').noPreserveCache();

const getInstallHandler = ({ readFile, writeFile, access, appendFile } = {}) => {
  return proxyquire.load('../../actions/install', {
    fs: {
      readFile,
      writeFile,
      appendFile,
      access
    }
  });
};

test('verifyInsideGitDirectory -> when inside a git repository -> not rejecting the promise', (t) => {
  const installHandler = getInstallHandler({
    access: sinon.stub().callsArgWith(2, undefined, true)
  });

  t.notThrows(installHandler.verifyInsideGitDirectory);
});

test('verifyInsideGitDirectory -> when not inside a git repository -> rejecting the promise', (t) => {
  const installHandler = getInstallHandler({
    access: sinon.stub().callsArgWith(2, new Error())
  });

  t.throws(installHandler.verifyInsideGitDirectory());
});

test(`getCurrentPostCheckoutHook -> when user requested force -> as if the post-checkout hook doesn't exist`, (t) => {
  const postCheckout = 'HOOK CONTENTS';
  const installHandler = getInstallHandler({
    readFile: sinon.stub().callsArgWith(2, undefined, postCheckout)
  });

  return installHandler.getCurrentPostCheckoutHook({ force: true })
    .then((postCheckoutHook) => {
      t.not(postCheckoutHook, postCheckout);
      t.is(postCheckoutHook, null);
    });
});

test(`getCurrentPostCheckoutHook -> when hook doesn't exist -> returned hook is null`, (t) => {
  const postCheckout = 'HOOK CONTENTS';
  const installHandler = getInstallHandler({
    readFile: sinon.stub().callsArgWith(2, new Error())
  });

  return installHandler.getCurrentPostCheckoutHook({ force: false })
  .then((postCheckoutHook) => {
    t.not(postCheckoutHook, postCheckout);
    t.is(postCheckoutHook, null);
  });
});

test(`getCurrentPostCheckoutHook -> when hook exists -> returned value is the contents of the hook`, (t) => {
  const postCheckout = 'HOOK CONTENTS';
  const installHandler = getInstallHandler({
    readFile: sinon.stub().callsArgWith(2, undefined, postCheckout)
  });

  return installHandler.getCurrentPostCheckoutHook({ force: false })
  .then((postCheckoutHook) => t.is(postCheckoutHook, postCheckout));
});

test(`verifyCurrentPostCheckoutIsNode -> when hook doesn't exist -> return the hook`, (t) => {
  const postCheckout = null;
  const installHandler = getInstallHandler();

  t.is(installHandler.verifyCurrentPostCheckoutIsNode(postCheckout), null);
});

test(`verifyCurrentPostCheckoutIsNode -> when hook isn't node -> throw an error`, (t) => {
  const postCheckout = 'HOOK CONTENTS';
  const installHandler = getInstallHandler();

  t.throws(() => installHandler.verifyCurrentPostCheckoutIsNode(postCheckout));
});

test(`verifyCurrentPostCheckoutIsNode -> when hook is node -> return the hook`, (t) => {
  const postCheckout = `${constants.nodeShebang} some more content`;
  const installHandler = getInstallHandler();

  t.is(installHandler.verifyCurrentPostCheckoutIsNode(postCheckout), postCheckout);
});

test(`verifyNotInstalledGitLatest -> hook doesn't exist -> return the hook`, (t) => {
  const postCheckout = null;
  const installHandler = getInstallHandler();

  t.is(installHandler.verifyNotInstalledGitLatest(postCheckout), null);
});

test(`verifyNotInstalledGitLatest -> hook not installed -> return the hook`, (t) => {
  const postCheckout = `${constants.nodeShebang} some more content`;
  const installHandler = getInstallHandler();

  t.is(installHandler.verifyNotInstalledGitLatest(postCheckout), postCheckout);
});

test(`verifyNotInstalledGitLatest -> git-latest already installed -> throw an error`, (t) => {
  const postCheckout = `${constants.nodeShebang} ${constants.beginningInstallMessage}`;
  const installHandler = getInstallHandler();

  t.throws(() => installHandler.verifyNotInstalledGitLatest(postCheckout));
});

test(`createHookWriteHandler -> hook doesn't exist -> writeHandler will write the file`, (t) => {
  const postCheckout = null;
  const installHandler = getInstallHandler();

  t.deepEqual(installHandler.createHookWriteHandler(postCheckout).writeAction, 'writeFile');
});

test(`createHookWriteHandler -> hook doesn't exist -> writeHandler will add node shebang at the beginning`, (t) => {
  const postCheckout = null;
  const writeHandler = getInstallHandler().createHookWriteHandler(postCheckout);
  const result = [constants.nodeShebang, constants.beginningInstallMessage, 'GIT LATEST HOOK', constants.endingInstallMessage];
  writeHandler.setGitLatestPostCheckout('GIT LATEST HOOK');
  t.deepEqual(writeHandler.transform(), result.join(os.EOL));
});

test(`createHookWriteHandler -> hook exists -> writeHandler will append to the file`, (t) => {
  const postCheckout = 'HOOK';
  const installHandler = getInstallHandler();

  t.deepEqual(installHandler.createHookWriteHandler(postCheckout).writeAction, 'appendFile');
});

test(`createHookWriteHandler -> hook exists -> writeHandler will not add node shebang`, (t) => {
  const postCheckout = 'HOOK';
  const writeHandler = getInstallHandler().createHookWriteHandler(postCheckout);
  const result = [constants.beginningInstallMessage, 'GIT LATEST HOOK', constants.endingInstallMessage];
  writeHandler.setGitLatestPostCheckout('GIT LATEST HOOK');

  t.deepEqual(writeHandler.transform(), result.join(os.EOL));
});

test('setGitLatestPostCheckoutHook -> sets the git-latest hook to the write handler', (t) => {
  const gitLatestHook = 'GIT LATEST HOOK';
  const setGitLatestPostCheckout = sinon.spy();
  const readFile = sinon.stub().callsArgWith(2, undefined, gitLatestHook);

  return getInstallHandler({ readFile }).setGitLatestPostCheckoutHook({ setGitLatestPostCheckout }).then(() => {
    t.is(setGitLatestPostCheckout.calledWith(gitLatestHook), true)
  });
});

test('writeGitLatestPostCheckoutHook -> writes the content to the post-checkout hook', (t) => {
  const gitLatestHook = 'GIT LATEST HOOK';
  const writeFile = sinon.stub().callsArgWith(3, undefined, true);
  const writeHandler = {
    writeAction: 'writeFile',
    transform: () => gitLatestHook
  };

  return getInstallHandler({ writeFile }).writeGitLatestPostCheckoutHook(writeHandler).then(() => {
    t.is(writeFile.calledWith(constants.postCheckoutPath, gitLatestHook, { mode: 0o777 }), true);
  });
});

test('writeGitLatestPostCheckoutHook -> appends the content to the post-checkout hook', (t) => {
  const gitLatestHook = 'GIT LATEST HOOK';
  const appendFile = sinon.stub().callsArgWith(3, undefined, true);
  const writeHandler = {
    writeAction: 'appendFile',
    transform: () => gitLatestHook
  };

  return getInstallHandler({ appendFile }).writeGitLatestPostCheckoutHook(writeHandler).then(() => {
    t.is(appendFile.calledWith(constants.postCheckoutPath, gitLatestHook, { mode: 0o777 }), true);
  });
});

test('clearLatestBranchesFile -> clears the latest file contents', (t) => {
  const writeFile = sinon.stub().callsArgWith(2, undefined, true);

  return getInstallHandler({ writeFile }).clearLatestBranchesFile().then(() => {
    t.is(writeFile.calledWith(constants.latestPath, ''), true);
  });
});