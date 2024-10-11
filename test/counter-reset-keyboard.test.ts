import test from 'tape';
import { JSDOM } from 'jsdom';
import { update, view, subscriptions } from './counter-reset-keyboard';

// Set up JSDOM
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document as unknown as Document;
global.window = dom.window as unknown as (Window & typeof globalThis);

test('Counter update function', (t) => {
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

  t.equal(viewElement.tagName, 'DIV', 'View returns a div element');
  t.equal(viewElement.childNodes.length, 4, 'View has 4 child elements');
  t.equal((viewElement.childNodes[1] as HTMLElement).textContent, '5', 'Counter value is displayed correctly');
  t.equal((viewElement.childNodes[3] as HTMLButtonElement).textContent, 'Reset', 'Reset button is present');
});

test('Counter subscriptions function', (t) => {
  t.plan(2);

  const mockSignal = (action: string) => {
    return () => {
      t.pass(`Signal called with action: ${action}`);
    };
  };

  subscriptions(mockSignal);

  // Simulate key presses
  const upEvent = new dom.window.KeyboardEvent('keyup', { keyCode: 38 });
  document.dispatchEvent(upEvent);

  const downEvent = new dom.window.KeyboardEvent('keyup', { keyCode: 40 });
  document.dispatchEvent(downEvent);
});
