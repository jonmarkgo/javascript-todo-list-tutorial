import { view as todoAppView } from './todo-app';

export { todoAppView as view };

const id: string = 'test-app';

interface Model {
  counters: number[];
}

interface Assert {
  equal: (actual: any, expected: any) => void;
}

export function test(name: string, callback: (assert: Assert) => void): void {
  // Implementation of test function
}

export function update(action: any, model: any): any {
  // Implementation of update function
}

export function mount(model: any, update: any, view: (model: any, signal: any) => HTMLElement, root_element_id: string): void {
  // Implementation of mount function
}

export function empty(element: HTMLElement): void {
  // Implementation of empty function
}

export function div(id: string): HTMLElement {
  const element = document.createElement('div');
  element.id = id;
  return element;
}

export function button(attrs: string[], children: (HTMLElement | Text)[]): HTMLButtonElement {
  const button = document.createElement('button');
  attrs.forEach(attr => {
    const [key, value] = attr.split('=');
    button.setAttribute(key, value);
  });
  children.forEach(child => button.appendChild(child));
  return button;
}

test('update(0, "inc") returns 1 (increment)',
    function(assert: Assert) {
  const result: any = update('inc', 0);
  assert.equal(result, 1);
});

test('Test Update increment: update(1, "inc") returns 2', function(assert: Assert) {
  const result: any = update("inc", 1);
  console.log('result', result);
  assert.equal(result, 2);
});

test('Test Update decrement: update(1, "dec") returns 0', function(assert: Assert) {
  const result: any = update("dec", 1);
  assert.equal(result, 0);
});

test('Test negative state: update(-9, "inc") returns -8', function(assert: Assert) {
  const result: any = update("inc", -9);
  assert.equal(result, -8);
});

test('mount(7, update, todoAppView, "' + id + '") sets initial state to 7', function(assert: Assert) {
  mount(7, update, todoAppView as any, id);
  const state = document.getElementById(id)
    ?.getElementsByClassName('count')[0].textContent;
  assert.equal(state, '7');
});

test('empty("test-app") should clear DOM in root node', function(assert: Assert) {
  const element = document.getElementById(id);
  if (element) empty(element);
  mount(7, update, todoAppView as any, id);
  const newElement = document.getElementById(id);
  if (newElement) empty(newElement);
  const result = document.getElementById(id)?.innerHTML;
  assert.equal(result, '');
});

test('click on "+" button to re-render state (increment model by 1)',
function(assert: Assert) {
  document.body.appendChild(div(id));
  mount(7, update, todoAppView as any, id);
  const incButton = document.getElementById(id)?.getElementsByClassName('inc')[0] as HTMLElement;
  if (incButton) incButton.click();
  const state = document.getElementById(id)
    ?.getElementsByClassName('count')[0].textContent;
  assert.equal(state, '8'); // model was incremented successfully
  const element = document.getElementById(id);
  if (element) empty(element); // clean up after tests
});

// Reset Functionality

test('Test reset counter when model/state is 7 returns 0', function(assert: Assert) {
  const result: any = update("reset", 7);
  assert.equal(result, 0);
});

test('reset button should be present on page', function(assert: Assert) {
  const reset: HTMLCollectionOf<Element> = document.getElementsByClassName('reset');
  assert.equal(reset.length, 3);
});

test('Click reset button resets state to 0', function(assert: Assert) {
  mount(7, update, todoAppView as any, id);
  const root: HTMLElement | null = document.getElementById(id);
  assert.equal(root?.getElementsByClassName('count')[0].textContent, '7');
  const btn: Element | undefined = root?.getElementsByClassName("reset")[0];
  if (btn) (btn as HTMLElement).click(); // Click the Reset button!
  const state = root?.getElementsByClassName('count')[0].textContent;
  assert.equal(state, '0'); // state was successfully reset to 0!
  if (root) empty(root); // clean up after tests
});
