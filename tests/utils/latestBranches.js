const test = require('ava');
const os = require('os');
const sinon = require('sinon');
const constants = require('../../utils/constants');
const proxyquire = require('proxyquire').noPreserveCache();

const getLatestBranches = ({ readFile } = {}) => {
  return proxyquire.load('../../utils/latestBranches', {
    fs: {
      readFile
    }
  });
};

test('when there are no branches -> returns an empty array', (t) => {
  const readFile = sinon.stub().callsArgWith(2, undefined, '');
  return getLatestBranches({ readFile })().then((branches) => t.deepEqual(branches, []));
});

test(`when there's one branch -> returns an array with that branch`, (t) => {
  return getLatestBranches({ readFile: sinon.stub().callsArgWith(2, undefined, 'branch') })().then((branches) => {
    t.deepEqual(branches, ['branch']);
  });
});

test(`when there's more than one branch -> returns an array with that right amount of branches`, (t) => {
  const orignalBranches = new Array(Math.round(Math.random() * 1000)).fill('branch').fill('branch').map((branchName, index) => branchName + index);
  return getLatestBranches({ readFile: sinon.stub().callsArgWith(2, undefined, orignalBranches.join(os.EOL)) })().then((branches) => {
    t.deepEqual(branches, orignalBranches);
  });
});

test(`verify -> when there are no branches -> throws an exception`, (t) => {
  t.throws(() => getLatestBranches().verify([]));
});

test(`verify -> when there branches -> returns the branches`, (t) => {
  const branches = ['branches'];
  t.is(getLatestBranches().verify(branches), branches);
});