import { expect } from 'chai';

const id: string = 'test-app';

interface Model {
  counters: number[];
}

interface Assert {
  equal: (actual: any, expected: any) => void;
}

type Action = 'inc' | 'dec' | 'reset';

// declare function test(name: string, callback: (assert: Assert) => void): void;
declare function update(model: Model, action?: Action): Model;
declare function mount(model: Model, update: (model: Model, action?: Action) => Model, id: string): void;
declare function empty(node: HTMLElement): void;
declare function div(id: string): HTMLElement;

it('update({counters:[0]}) returns {counters:[0]} (current state unmodified)', function() {
  const result: Model = update({counters:[0]});
  expect(result.counters[0]).to.equal(0);
});

it('Test Update increment: update(1, "inc") returns 2', function() {
  const result: Model = update({counters: [1] }, "inc");
  console.log('result', result);
  expect(result.counters[0]).to.equal(2);
});

it('Test Update decrement: update(1, "dec") returns 0', function() {
  const result: Model = update({counters: [1] }, "dec");
  expect(result.counters[0]).to.equal(0);
});

it('Test negative state: update(-9, "inc") returns -8', function() {
  const result: Model = update({counters: [-9] }, "inc");
  expect(result.counters[0]).to.equal(-8);
});

it('mount({model: 7, update: update}, "' + id +'") sets initial state to 7', function() {
  mount({counters:[7]}, update, id);
  const state: string | null | undefined = document.getElementById(id)
    ?.getElementsByClassName('count')[0].textContent;
  expect(state).to.equal('7');
});

it('empty("test-app") should clear DOM in root node', function() {
  const element = document.getElementById(id);
  if (element) empty(element);
  mount({counters:[7]}, update, id);
  const newElement = document.getElementById(id);
  if (newElement) empty(newElement);
  const result: string | undefined = document.getElementById(id)?.innerHTML;
  expect(result).to.be.undefined;
});

it('click on "+" button to re-render state (increment model by 1)', function() {
  document.body.appendChild(div(id));
  mount({counters:[7]}, update, id);
  (document.getElementById(id)?.getElementsByClassName('inc')[0] as HTMLElement)?.click();
  const state: string | null | undefined = document.getElementById(id)
    ?.getElementsByClassName('count')[0].textContent;
  expect(state).to.equal('8'); // model was incremented successfully
  const element = document.getElementById(id);
  if (element) empty(element); // clean up after tests
});

// Reset Functionality

it('Test reset counter when model/state is 6 returns 0', function() {
  const result: Model = update({counters:[7]}, "reset");
  expect(result.counters[0]).to.equal(0);
});

it('reset button should be present on page', function() {
  const reset: HTMLCollectionOf<Element> = document.getElementsByClassName('reset');
  expect(reset.length).to.equal(3);
});

it('Click reset button resets state to 0', function() {
  mount({counters:[7]}, update, id);
  const root: HTMLElement | null = document.getElementById(id);
  expect(root?.getElementsByClassName('count')[0].textContent).to.equal('7');
  const btn: Element | undefined = root?.getElementsByClassName("reset")[0]; // click reset button
  (btn as HTMLElement)?.click(); // Click the Reset button!
  const state: string | null | undefined = root?.getElementsByClassName('count')[0].textContent;
  expect(state).to.equal('0'); // state was successfully reset to 0!
  if (root) empty(root); // clean up after tests
});
