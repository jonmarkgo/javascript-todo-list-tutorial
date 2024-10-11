import test from 'tape';
import { JSDOM } from 'jsdom';
import { update, view, mount, empty, button, div, container } from '../src/counter';

// Set up JSDOM
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document as unknown as Document;
global.window = dom.window as unknown as (Window & typeof globalThis);

// Ensure the test is running
console.log('Counter test file is being executed');

test('Counter update function', (t) => {
  console.log('Running Counter update function test');
  t.plan(4);

  t.equal(update('inc', 0), 1, 'Increment from 0');
  t.equal(update('dec', 1), 0, 'Decrement from 1');
  t.equal(update('dec', 0), 0, 'Decrement from 0 should not go below 0');
  t.equal(update('reset', 5), 0, 'Reset should set counter to 0');
});

test('Counter view function', (t) => {
  t.plan(4);

  const mockSignal = (action: string) => () => {};
  const viewElement = view(5, mockSignal);

  t.equal(viewElement.tagName, 'SECTION', 'View returns a section element');
  t.equal(viewElement.childNodes.length, 4, 'View has 4 child elements');
  t.equal((viewElement.childNodes[1] as HTMLElement).textContent, '5', 'Counter value is displayed correctly');
  t.equal((viewElement.childNodes[3] as HTMLButtonElement).textContent, 'Reset', 'Reset button is present');
});

test('Counter mount function', (t) => {
  t.plan(2);

  document.body.innerHTML = '<div id="root"></div>';
  const rootElement = document.getElementById('root');

  mount(0, update, view, 'root');

  t.ok(rootElement?.firstChild, 'Mount function adds elements to the root');
  t.equal((rootElement?.firstChild as HTMLElement).tagName, 'SECTION', 'Mount function adds a section element');
});

test('Counter helper functions', (t) => {
  t.plan(5);

  const testDiv = document.createElement('div');
  testDiv.innerHTML = '<p>Test</p>';
  empty(testDiv);
  t.equal(testDiv.childNodes.length, 0, 'Empty function removes all child nodes');

  const testButton = button('+', () => () => {}, 'inc');
  t.equal(testButton.tagName, 'BUTTON', 'Button function creates a button element');
  t.equal(testButton.textContent, '+', 'Button has correct text content');

  const testDivElement = div('test-div', 'Test Content');
  t.equal(testDivElement.id, 'test-div', 'Div function sets correct id');
  t.equal(testDivElement.textContent, 'Test Content', 'Div function sets correct text content');
});
