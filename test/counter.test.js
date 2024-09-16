// Add TextEncoder and TextDecoder polyfills
if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder;
}
if (typeof TextDecoder === 'undefined') {
  global.TextDecoder = require('util').TextDecoder;
}

const { JSDOM } = require('jsdom');
const { update, view, mount } = require('./counter.js');
const { describe, test, expect } = require('@jest/globals');

// Set up JSDOM
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;

describe('Counter', () => {
  test('update function', () => {
    const initialModel = 0;

    expect(update('inc', initialModel)).toBe(1);
    expect(update('dec', initialModel)).toBe(-1);
    expect(update('reset', 5)).toBe(0);
  });

  test('view function', () => {
    const model = 5;
    const mockSignal = jest.fn(() => () => {});

    const result = view(model, mockSignal);

    expect(result.tagName).toBe('SECTION');
    expect(result.className).toBe('counter');
    expect(result.childNodes.length).toBe(4);

    const [incButton, countDiv, decButton, resetButton] = Array.from(result.childNodes);

    expect(incButton.textContent).toBe('+');
    expect(countDiv.textContent).toBe('5');
    expect(decButton.textContent).toBe('-');
    expect(resetButton.textContent).toBe('Reset');
  });

  test('mount function', () => {
    // Create a root element
    const root = document.createElement('div');
    root.id = 'root';
    document.body.appendChild(root);

    // Pass the actual document to the mount function
    mount(0, update, view, 'root');

    expect(document.querySelector('.counter')?.childNodes.length).toBe(4);
    expect(() => mount(0, update, view, 'root')).not.toThrow();
  });
});
