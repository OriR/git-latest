const test = require('ava');
const sinon = require('sinon');
const os = require('os');
const proxyquire = require('proxyquire').noPreserveCache();

const getClearHandler = ({ prompt, writeFile } = {}) => {
  return proxyquire.load('../../actions/clear', {
    inquirer: {
      prompt
    },
    fs: {
      writeFile
    }
  });
};

const getBranches = () => {
  return new Array(Math.round(Math.random() * 1000)).fill('branch').map((branchName, index) => branchName + index);
};

const getSelectionFromBranches = (branches) => {
  return new Array(Math.round(Math.random() * (branches.length - 1))).fill('').map(() => {
    return branches[Math.round(Math.random() * (branches.length - 1))];
  });
};

test('getSelectedBranches -> keep a number of branches -> return only the given number of latest branches', (t) => {
  const branches = getBranches();
  const argv = { keep: Math.random() * branches.length };

  return getClearHandler().getSelectedBranches(argv, branches).then((data) => {
    t.deepEqual(data.selectedBranches, branches.slice(0, argv.keep));
    t.is(argv.white, false);
    t.is(argv.w, false);
  });
});

test('getSelectedBranches -> multi select branches -> return the selected branches', (t) => {
  const branches = getBranches();
  const selectedBranches = getSelectionFromBranches(branches);
  const prompt = sinon.stub().returns(Promise.resolve({ branch: selectedBranches }));

  return getClearHandler({ prompt }).getSelectedBranches({ multiple: true }, branches).then((data) => {
    t.deepEqual(data.selectedBranches, selectedBranches);
  });
});

test('getSelectedBranches -> single select branch -> return the selected branch', (t) => {
  const branches = getBranches();
  const selectedBranch = branches[Math.round(Math.random() * branches.length)];
  const prompt = sinon.stub().returns(Promise.resolve({ branch: selectedBranch }));

  return getClearHandler({ prompt }).getSelectedBranches({}, branches).then((data) => t.deepEqual(data.selectedBranches, [selectedBranch]));
});

test('getKeptBranches -> when white list -> return the inverse from all the branches of the selected branches', (t) => {
  const branches = getBranches();
  const selectedBranches = getSelectionFromBranches(branches);

  const keptBranches = getClearHandler().getKeptBranches({ white: true }, { selectedBranches, branches });
  t.deepEqual(keptBranches, branches.filter((item) => !selectedBranches.includes(item)));
});

test('getKeptBranches -> when black list -> return the selected branches', (t) => {
  const branches = getBranches();
  const selectedBranches = getSelectionFromBranches(branches);

  const keptBranches = getClearHandler().getKeptBranches({ white: false }, { selectedBranches, branches });
  t.deepEqual(keptBranches, selectedBranches);
});

test('writeKeptBranches -> write the given branches to the latest file', (t) => {
  const branches = getBranches();
  const writeFile = sinon.stub().callsArgWith(2, undefined, true);

  return getClearHandler({ writeFile }).writeKeptBranches(branches).then(() => {
    t.is(writeFile.calledWith(sinon.match.string, branches.join(os.EOL)), true);
  });
});
