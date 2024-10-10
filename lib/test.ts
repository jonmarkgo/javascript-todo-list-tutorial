import { mount, empty } from './elmish';

interface Assert {
  equal: (actual: any, expected: any) => void;
}

declare function test(name: string, callback: (assert: Assert) => void): void;

type Model = any; // We'll use 'any' for now, but this should be refined based on actual usage
type Action = string; // Actions are typically strings in this implementation

declare function update(action: Action, model: Model, data?: any): Model;
declare function view(model: Model, signal: (action: Action, data?: any, model?: Model) => () => void): HTMLElement;

const id: string = 'test-app';

test('update({counters:[0]}) returns {counters:[0]} (current state unmodified)',
    function(assert: Assert) {
  const result = update('', 0);
  assert.equal(result, 0);
});

test('Test Update increment: update(1, "inc") returns 2', function(assert: Assert) {
  const result = update('inc', 1);
  console.log('result', result);
  assert.equal(result, 2);
});

test('Test Update decrement: update(1, "dec") returns 0', function(assert: Assert) {
  const result = update('dec', 1);
  assert.equal(result, 0);
});

test('Test negative state: update(-9, "inc") returns -8', function(assert: Assert) {
  const result = update('inc', -9);
  assert.equal(result, -8);
});

test('mount({model: 7, update: update, view: view}, "'
  + id +'") sets initial state to 7', function(assert: Assert) {
  mount(7, update, view, id);
  const state = document.getElementById(id)
    ?.getElementsByClassName('count')[0]?.textContent;
  assert.equal(state, '7');
});

test('empty("test-app") should clear DOM in root node', function(assert: Assert) {
  const element = document.getElementById(id);
  if (element) empty(element);
  mount(7, update, view, id);
  if (element) empty(element);
  const result = document.getElementById(id)?.innerHTML;
  assert.equal(result, '');
});

test('click on "+" button to re-render state (increment model by 1)',
function(assert: Assert) {
  document.body.appendChild(div(id));
  mount(7, update, view, id);
  const incButton = document.getElementById(id)?.getElementsByClassName('inc')[0] as HTMLElement;
  incButton?.click();
  const state = document.getElementById(id)
    ?.getElementsByClassName('count')[0]?.textContent;
  assert.equal(state, '8'); // model was incremented successfully
  const element = document.getElementById(id);
  if (element) empty(element); // clean up after tests
});

// Reset Functionality

test('Test reset counter when model/state is 6 returns 0', function(assert: Assert) {
  const result = update('reset', 7);
  assert.equal(result, 0);
});

test('reset button should be present on page', function(assert: Assert) {
  const reset: HTMLCollectionOf<Element> = document.getElementsByClassName('reset');
  assert.equal(reset.length, 3);
});

test('Click reset button resets state to 0', function(assert: Assert) {
  mount(7, update, view, id);
  const root: HTMLElement | null = document.getElementById(id);
  assert.equal(root?.getElementsByClassName('count')[0]?.textContent, '7');
  const btn: Element | undefined = root?.getElementsByClassName("reset")[0];
  (btn as HTMLElement)?.click(); // Click the Reset button!
  const state = root?.getElementsByClassName('count')[0]?.textContent;
  assert.equal(state, '0'); // state was successfully reset to 0!
  if (root) empty(root); // clean up after tests
});
