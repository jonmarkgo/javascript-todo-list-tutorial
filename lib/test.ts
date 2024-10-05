const id: string = 'test-app';

interface Model {
  counters: number[];
}

interface Assert {
  equal: (actual: any, expected: any) => void;
}

type TestAction = 'inc' | 'dec' | 'reset';

declare function test(name: string, callback: (assert: Assert) => void): void;
declare function update(model: Model, action?: TestAction): Model;
declare function mount(model: Model, update: (model: Model, action?: TestAction) => Model, view: (model: Model) => HTMLElement, id: string): void;
declare function empty(element: HTMLElement | null): void;
declare function div(id: string): HTMLElement;

test('update({counters:[0]}) returns {counters:[0]} (current state unmodified)',
    function(assert: Assert) {
  const result: Model = update({counters:[0]});
  assert.equal(result.counters[0], 0);
});

test('Test Update increment: update(1, "inc") returns 2', function(assert: Assert) {
  const result: Model = update({counters: [1] }, "inc");
  console.log('result', result);
  assert.equal(result.counters[0], 2);
});

test('Test Update decrement: update(1, "dec") returns 0', function(assert: Assert) {
  const result: Model = update({counters: [1] }, "dec");
  assert.equal(result.counters[0], 0);
});

test('Test negative state: update(-9, "inc") returns -8', function(assert: Assert) {
  const result: Model = update({counters: [-9] }, "inc");
  assert.equal(result.counters[0], -8);
});

test('mount({model: 7, update: update, view: view}, "'
  + id +'") sets initial state to 7', function(assert: Assert) {
  mount({counters:[7]}, update, view, id);
  const state: string | null = document.getElementById(id)
    ?.getElementsByClassName('count')[0].textContent;
  assert.equal(state, 7);
});

test('empty("test-app") should clear DOM in root node', function(assert: Assert) {
  empty(document.getElementById(id));
  mount({counters:[7]}, update, view, id);
  empty(document.getElementById(id));
  const result: string | undefined = document.getElementById(id)?.innerHTML;
  assert.equal(result, undefined);
});

test('click on "+" button to re-render state (increment model by 1)',
function(assert: Assert) {
  document.body.appendChild(div(id));
  mount({counters:[7]}, update, view, id);
  document.getElementById(id)?.getElementsByClassName('inc')[0].click();
  const state: string | null = document.getElementById(id)
    ?.getElementsByClassName('count')[0].textContent;
  assert.equal(state, 8); // model was incremented successfully
  empty(document.getElementById(id)); // clean up after tests
});

// Reset Functionality

test('Test reset counter when model/state is 6 returns 0', function(assert: Assert) {
  const result: Model = update({counters:[7]}, "reset");
  assert.equal(result.counters[0], 0);
});

test('reset button should be present on page', function(assert: Assert) {
  const reset: HTMLCollectionOf<Element> = document.getElementsByClassName('reset');
  assert.equal(reset.length, 3);
});

test('Click reset button resets state to 0', function(assert: Assert) {
  mount({counters:[7]}, update, view, id);
  const root: HTMLElement | null = document.getElementById(id);
  assert.equal(root?.getElementsByClassName('count')[0].textContent, 7);
  const btn: Element | undefined = root?.getElementsByClassName("reset")[0]; // click reset button
  (btn as HTMLElement)?.click(); // Click the Reset button!
  const state: string | null = root?.getElementsByClassName('count')[0].textContent;
  assert.equal(state, 0); // state was successfully reset to 0!
  empty(root); // clean up after tests
});
