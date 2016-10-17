const test = require('ava');
const sinon = require('sinon');
const promisify = require('../../utils/promisify');

test('when accessing a property -> returns that property with no wrapper', (t) => {
  const original = { prop: 1, deepProp: {a: 1, b: 's'}};
  const promisified = promisify(original);

  t.is(promisified.prop, 1);
  t.is(promisified.deepProp, original.deepProp);
});

test('when calling a function -> returns a promise instead of the node-base callback', (t) => {
  const promisified = promisify({ func(){} });

  t.is(promisified.func() instanceof Promise, true);
});

test('when calling a function -> the promise fails if the callback is being called with an error', (t) => {
  const promisified = promisify({ func: sinon.stub().callsArgWith(0, new Error()) });

  return t.throws(promisified.func());
});

test('when calling a function with arguments -> transfers these arguments to the actual call', (t) => {
  const firstArg = 1;
  const secondArg = 'second';

  const func = sinon.stub().callsArgWith(2, undefined, { firstArg, secondArg });
  const promisified = promisify({ func:  func});

  return promisified.func(firstArg, secondArg).then((value) => {
    t.is(func.calledWith(value.firstArg, value.secondArg), true);
  });
});