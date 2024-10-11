import { CounterAction, CounterModel, Assert, Signal } from '../types';

const id: string = 'test-app';

// Helper function to create a signal
function createSignal(action: CounterAction): () => void {
  return () => {};
}

declare function test(name: string, callback: (assert: Assert) => void): void;
declare function update(action: CounterAction, model: CounterModel): CounterModel;
declare function mount(
  model: CounterModel,
  update: (action: CounterAction, model: CounterModel) => CounterModel,
  view: (model: CounterModel, signal: Signal) => HTMLElement,
  root_element_id: string
): void;
declare function empty(node: HTMLElement): void;
declare function div(divid: string, text?: string): HTMLDivElement;

// Update test cases to use the new function signatures and handle potential null values
test('update({counters:[0]}) returns {counters:[1]} (increment)',
    function(assert: Assert) {
  const result: CounterModel = update('inc', 0);
  assert.equal(result, 1);
});

test('Test Update increment: update(1, "inc") returns 2', function(assert: Assert) {
  const result: CounterModel = update('inc', 1);
  console.log('result', result);
  assert.equal(result, 2);
});

test('Test Update decrement: update(1, "dec") returns 0', function(assert: Assert) {
  const result: CounterModel = update('dec', 1);
  assert.equal(result, 0);
});

test('Test negative state: update(-9, "inc") returns -8', function(assert: Assert) {
  const result: CounterModel = update('inc', -9);
  assert.equal(result, -8);
});

test('mount({model: 7, update: update, view: view}, "' + id +'") sets initial state to 7', function(assert: Assert) {
  mount(7,
    (action: CounterAction, model: CounterModel) => update(action, model),
    (model: CounterModel, signal: Signal) => {
      const el = document.createElement('div');
      el.className = 'count';
      el.textContent = model.toString();
      return el;
    },
    id
  );
  const state = document.getElementById(id)?.getElementsByClassName('count')[0]?.textContent;
  assert.equal(state, '7');
});

test('empty("test-app") should clear DOM in root node', function(assert: Assert) {
  const rootElement = document.getElementById(id);
  if (rootElement) empty(rootElement);
  mount(7,
    (action: CounterAction, model: CounterModel) => update(action, model),
    (model: CounterModel, signal: Signal) => {
      const el = document.createElement('div');
      el.className = 'count';
      el.textContent = model.toString();
      return el;
    },
    id
  );
  if (rootElement) empty(rootElement);
  const result = document.getElementById(id)?.innerHTML;
  assert.equal(result, '');
});

test('click on "+" button to re-render state (increment model by 1)',
function(assert: Assert) {
  document.body.appendChild(div(id));
  mount(7,
    (action: CounterAction, model: CounterModel) => update(action, model),
    (model: CounterModel, signal: Signal) => {
      const el = document.createElement('div');
      el.className = 'count';
      el.textContent = model.toString();
      const button = document.createElement('button');
      button.className = 'inc';
      button.onclick = signal('inc');
      el.appendChild(button);
      return el;
    },
    id
  );
  const incButton = document.getElementById(id)?.getElementsByClassName('inc')[0] as HTMLElement;
  incButton?.click();
  const state = document.getElementById(id)?.getElementsByClassName('count')[0]?.textContent;
  assert.equal(state, '8'); // model was incremented successfully
  const rootElement = document.getElementById(id);
  if (rootElement) empty(rootElement); // clean up after tests
});

// Reset Functionality

test('Test reset counter when model/state is 6 returns 0', function(assert: Assert) {
  const result: CounterModel = update('reset', 7);
  assert.equal(result, 0);
});

test('reset button should be present on page', function(assert: Assert) {
  mount(7,
    (action: CounterAction, model: CounterModel) => update(action, model),
    (model: CounterModel, signal: Signal) => {
      const el = document.createElement('div');
      el.className = 'count';
      el.textContent = model.toString();
      const button = document.createElement('button');
      button.className = 'reset';
      button.onclick = signal('reset');
      el.appendChild(button);
      return el;
    },
    id
  );
  const reset: HTMLCollectionOf<Element> = document.getElementsByClassName('reset');
  assert.equal(reset.length, 1);
  const rootElement = document.getElementById(id);
  if (rootElement) empty(rootElement); // clean up after tests
});

test('Click reset button resets state to 0', function(assert: Assert) {
  mount(7,
    (action: CounterAction, model: CounterModel) => update(action, model),
    (model: CounterModel, signal: Signal) => {
      const el = document.createElement('div');
      el.className = 'count';
      el.textContent = model.toString();
      const button = document.createElement('button');
      button.className = 'reset';
      button.onclick = signal('reset');
      el.appendChild(button);
      return el;
    },
    id
  );
  const root: HTMLElement | null = document.getElementById(id);
  assert.equal(root?.getElementsByClassName('count')[0].textContent, '7');
  const btn: HTMLElement | null = root?.getElementsByClassName("reset")[0] as HTMLElement;
  btn?.click(); // Click the Reset button!
  const state = root?.getElementsByClassName('count')[0]?.textContent;
  assert.equal(state, '0'); // state was successfully reset to 0!
  if (root) empty(root); // clean up after tests
});
