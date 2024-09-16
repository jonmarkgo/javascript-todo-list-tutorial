import test from 'tape';
import { JSDOM } from 'jsdom';
import { update, view, mount, Action, Model } from './counter';

// Set up JSDOM
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window as unknown as (Window & typeof globalThis);

test('Counter - update function', (t) => {
  const initialModel: Model = 0;

  t.equal(update('inc', initialModel), 1, 'Increment should add 1 to the model');
  t.equal(update('dec', initialModel), -1, 'Decrement should subtract 1 from the model');
  t.equal(update('reset', 5), 0, 'Reset should set the model to 0');
  t.equal(update('invalid' as Action, initialModel), initialModel, 'Invalid action should return current state');

  t.end();
});

test('Counter - view function', (t) => {
  const model: Model = 5;
  const mockSignal = (action: Action) => () => {};

  const result = view(model, mockSignal);

  t.equal(result.tagName, 'SECTION', 'View should return a section element');
  t.equal(result.className, 'counter', 'View should have class "counter"');
  t.equal(result.childNodes.length, 4, 'View should have 4 child nodes');

  const [incButton, countDiv, decButton, resetButton] = Array.from(result.childNodes);

  t.equal((incButton as HTMLButtonElement).textContent, '+', 'First button should be increment');
  t.equal((countDiv as HTMLDivElement).textContent, '5', 'Count div should display current model value');
  t.equal((decButton as HTMLButtonElement).textContent, '-', 'Third button should be decrement');
  t.equal((resetButton as HTMLButtonElement).textContent, 'Reset', 'Fourth button should be reset');

  t.end();
});

test('Counter - mount function', (t) => {
  // Create a root element
  const root = document.createElement('div');
  root.id = 'root';
  document.body.appendChild(root);

  // Pass the actual document to the mount function
  mount(0, update, view, 'root', document);

  t.equal(document.querySelector('.counter')?.childNodes.length, 4, 'Mount should create counter with 4 child nodes');
  t.pass('Mount function should execute without errors');
  t.end();
});
