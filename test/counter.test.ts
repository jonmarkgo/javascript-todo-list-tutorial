import test from 'tape';
import { JSDOM } from 'jsdom';
import { Action, Model, update, view, mount, div, button, empty } from './counter';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window as unknown as Window & typeof globalThis;

test('Counter component', (t) => {
  t.test('update function', (st) => {
    const initialModel: Model = { count: 0 };

    st.deepEqual(update('inc', initialModel), { count: 1 }, 'should increment count');
    st.deepEqual(update('dec', initialModel), { count: -1 }, 'should decrement count');
    st.deepEqual(update('reset', { count: 5 }), { count: 0 }, 'should reset count to 0');
    st.deepEqual(update('invalid' as Action, initialModel), initialModel, 'should return current model for invalid action');

    st.end();
  });

  t.test('view function', (st) => {
    const model: Model = { count: 3 };
    const mockSignal = (action: Action) => () => {};

    const result = view(model, mockSignal);

    st.equal(result.tagName, 'SECTION', 'should return a section element');
    st.equal(result.className, 'counter', 'should have class "counter"');
    st.equal(result.childNodes.length, 4, 'should have 4 child nodes');

    const [incButton, countDiv, decButton, resetButton] = result.childNodes;

    st.equal((incButton as HTMLButtonElement).textContent, '+', 'should have increment button');
    st.equal((countDiv as HTMLDivElement).textContent, '3', 'should display correct count');
    st.equal((decButton as HTMLButtonElement).textContent, '-', 'should have decrement button');
    st.equal((resetButton as HTMLButtonElement).textContent, 'Reset', 'should have reset button');

    st.end();
  });

  t.test('mount function', (st) => {
    // Create a mock DOM environment
    const mockRoot = document.createElement('div');
    mockRoot.id = 'root';
    document.body.appendChild(mockRoot);

    const initialModel: Model = { count: 0 };
    mount(initialModel, update, view, 'root');

    st.equal(mockRoot.childNodes.length, 1, 'should append one child to root');
    st.equal(mockRoot.firstChild!.childNodes.length, 4, 'should have 4 elements in the view');

    // Clean up
    document.body.removeChild(mockRoot);

    st.end();
  });

  t.test('helper functions', (st) => {
    st.test('empty function', (s) => {
      const node = document.createElement('div');
      node.appendChild(document.createElement('span'));
      node.appendChild(document.createElement('p'));

      empty(node);

      s.equal(node.childNodes.length, 0, 'should remove all child nodes');
      s.end();
    });

    st.test('button function', (s) => {
      const mockSignal = (action: Action) => () => {};
      const btn = button('Test', mockSignal, 'inc');

      s.equal(btn.tagName, 'BUTTON', 'should return a button element');
      s.equal(btn.textContent, 'Test', 'should have correct text content');
      s.equal(btn.className, 'inc', 'should have correct class name');
      s.equal(btn.id, 'inc', 'should have correct id');

      s.end();
    });

    st.test('div function', (s) => {
      const divElement = div('test-div', 'Test content');

      s.equal(divElement.tagName, 'DIV', 'should return a div element');
      s.equal(divElement.id, 'test-div', 'should have correct id');
      s.equal(divElement.className, 'test-div', 'should have correct class name');
      s.equal(divElement.textContent, 'Test content', 'should have correct text content');

      s.end();
    });

    st.end();
  });

  t.end();
});
