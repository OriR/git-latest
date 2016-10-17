const test = require('ava');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noPreserveCache();

const getGit = ({ spawn = sinon.stub(), stdoutOn = sinon.stub(), stderrOn = sinon.stub() }) => {
  return proxyquire.load('../../utils/git', {
    'child_process': {
      spawn: spawn.returns({
        stdout: {
          on: stdoutOn
        },
        stderr: {
          on: stderrOn
        }
      })
    }
  });
};

test(`when calling checkout -> invokes git process correctly`, (t) => {
  const spawn = sinon.stub();
  return getGit({ spawn, stdoutOn: sinon.stub().callsArgWith(1, 1) }).checkout('branch').then(() => {
    t.is(spawn.calledWith('git', ['checkout', 'branch'], { cwd: process.cwd() }),true);
  });
});

test(`when can't checkout -> rejects the resulting promise`, (t) => {
  return t.throws(getGit({ stderrOn: sinon.stub().callsArgWith(1, new Error()) }).checkout('test'));
});

test(`when can checkout -> resolves the resulting promise`, (t) => {
  t.notThrows(getGit({ stdoutOn: sinon.stub().callsArgWith(1, 1) }).checkout('test'));
});

test(`when can checkout -> the resulting promise resolves without a value`, (t) => {
  return getGit({ stdoutOn: sinon.stub().callsArgWith(1, 'hello') }).checkout('branch').then((data) => t.is(data, undefined));
});