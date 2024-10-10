// Fix function signatures and update type annotations in test cases

const id: string = 'test-app';

// Model and Action types are defined elsewhere, so we don't need to redefine them here

interface Assert {
  equal: (actual: any, expected: any) => void;
}

// Function declarations with 'declare' keyword and correct signatures
declare function test(name: string, callback: (assert: Assert) => void): void;
declare function update(action: Action, model: Model): Model;
declare function mount(model: Model, update: (action: Action, model: Model) => Model, view: (model: Model, signal: (action: Action) => () => void) => HTMLElement, root_element_id: string): void;
declare function empty(node: HTMLElement): void;
declare function div(divid: string, text?: string): HTMLDivElement;
declare function view(model: Model): HTMLElement;

test('update({counters:[0]}) returns {counters:[0]} (current state unmodified)',
    function(assert: Assert) {
  const result: Model = update("inc", {counters:[0]});
  assert.equal(result.counters[0], 1);
});

test('Test Update increment: update({counters:[1]}, "inc") returns {counters:[2]}', function(assert: Assert) {
  const result: Model = update("inc", {counters: [1]});
  console.log('result', result);
  assert.equal(result.counters[0], 2);
});

test('Test Update decrement: update({counters:[1]}, "dec") returns {counters:[0]}', function(assert: Assert) {
  const result: Model = update("dec", {counters: [1]});
  assert.equal(result.counters[0], 0);
});

test('Test negative state: update({counters:[-9]}, "inc") returns {counters:[-8]}', function(assert: Assert) {
  const result: Model = update("inc", {counters: [-9]});
  assert.equal(result.counters[0], -8);
});

test('mount({counters:[7]}, update, view, "' + id + '") sets initial state to 7', function(assert: Assert) {
  mount({counters:[7]}, update, view, id);
  const state: string | null = document.getElementById(id)
    ?.getElementsByClassName('count')[0]?.textContent ?? null;
  assert.equal(state, '7');
});

test('empty("test-app") should clear DOM in root node', function(assert: Assert) {
  empty(document.getElementById(id) as HTMLElement);
  mount({counters:[7]}, update, view, id);
  empty(document.getElementById(id) as HTMLElement);
  const result: string | undefined = document.getElementById(id)?.innerHTML;
  assert.equal(result, '');
});

test('click on "+" button to re-render state (increment model by 1)',
function(assert: Assert) {
  document.body.appendChild(div(id));
  mount({counters:[7]}, update, view, id);
  const incButton = document.getElementById(id)?.getElementsByClassName('inc')[0] as HTMLElement;
  incButton?.click();
  const state: string | null = document.getElementById(id)
    ?.getElementsByClassName('count')[0]?.textContent ?? null;
  assert.equal(state, '8'); // model was incremented successfully
  empty(document.getElementById(id) as HTMLElement); // clean up after tests
});

// Reset Functionality

test('Test reset counter when model/state is 7 returns 0', function(assert: Assert) {
  const result: Model = update("reset", {counters:[7]});
  assert.equal(result.counters[0], 0);
});

test('reset button should be present on page', function(assert: Assert) {
  const reset: HTMLCollectionOf<Element> = document.getElementsByClassName('reset');
  assert.equal(reset.length, 3);
});

test('Click reset button resets state to 0', function(assert: Assert) {
  mount({counters:[7]}, update, view, id);
  const root: HTMLElement | null = document.getElementById(id);
  assert.equal(root?.getElementsByClassName('count')[0].textContent, '7');
  const btn: Element | undefined = root?.getElementsByClassName("reset")[0];
  (btn as HTMLElement)?.click(); // Click the Reset button!
  const state: string | null = root?.getElementsByClassName('count')[0]?.textContent ?? null;
  assert.equal(state, '0'); // state was successfully reset to 0!
  empty(root as HTMLElement); // clean up after tests
});
