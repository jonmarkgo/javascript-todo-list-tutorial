import { mount, empty, div, update, view } from './todo-app';

const id = 'test-app';

interface Assert {
  equal: (actual: any, expected: any) => void;
}

interface CounterModel {
  counters: number[];
}

function test(description: string, testFunction: (assert: Assert) => void): void {
  // Assuming a test framework is in place, this function would be implemented
  console.log(`Running test: ${description}`);
  testFunction({
    equal: (actual: any, expected: any) => {
      console.assert(actual === expected, `Expected ${expected}, but got ${actual}`);
    }
  });
}

test('update({counters:[0]}) returns {counters:[0]} (current state unmodified)',
    (assert: Assert) => {
  const result = update('NOOP', {counters:[0]});
  assert.equal(result.counters[0], 0);
});

test('Test Update increment: update(1, "inc") returns 2', (assert: Assert) => {
  const result = update('INCREMENT', {counters: [1]});
  console.log('result', result);
  assert.equal(result.counters[0], 2);
});

test('Test Update decrement: update(1, "dec") returns 0', (assert: Assert) => {
  const result = update('DECREMENT', {counters: [1]});
  assert.equal(result.counters[0], 0);
});

test('Test negative state: update(-9, "inc") returns -8', (assert: Assert) => {
  const result = update('INCREMENT', {counters: [-9]});
  assert.equal(result.counters[0], -8);
});

test('mount({model: 7, update: update, view: view}, "' + id +'") sets initial state to 7', (assert: Assert) => {
  mount({counters:[7]}, update, view, id);
  const state = document.getElementById(id)?.getElementsByClassName('count')[0]?.textContent;
  assert.equal(state, '7');
});

test('empty("test-app") should clear DOM in root node', (assert: Assert) => {
  const element = document.getElementById(id);
  if (element) empty(element);
  mount({counters:[7]}, update, view, id);
  if (element) empty(element);
  const result = document.getElementById(id)?.innerHTML;
  assert.equal(result, '');
});

test('click on "+" button to re-render state (increment model by 1)',
(assert: Assert) => {
  document.body.appendChild(div([id], []));
  mount({counters:[7]}, update, view, id);
  document.getElementById(id)?.getElementsByClassName('inc')[0]?.click();
  const state = document.getElementById(id)?.getElementsByClassName('count')[0]?.textContent;
  assert.equal(state, '8'); // model was incremented successfully
  const element = document.getElementById(id);
  if (element) empty(element); // clean up after tests
});

// Reset Functionality

test('Test reset counter when model/state is 6 returns 0', (assert: Assert) => {
  const result = update('RESET', {counters:[7]});
  assert.equal(result.counters[0], 0);
});

test('reset button should be present on page', (assert: Assert) => {
  const reset = document.getElementsByClassName('reset');
  assert.equal(reset.length, 3);
});

test('Click reset button resets state to 0', (assert: Assert) => {
  mount({counters:[7]}, update, view, id);
  const root = document.getElementById(id);
  assert.equal(root?.getElementsByClassName('count')[0]?.textContent, '7');
  const btn = root?.getElementsByClassName("reset")[0] as HTMLElement; // click reset button
  btn.click(); // Click the Reset button!
  const state = root?.getElementsByClassName('count')[0]?.textContent;
  assert.equal(state, '0'); // state was successfully reset to 0!
  if (root) empty(root); // clean up after tests
});
