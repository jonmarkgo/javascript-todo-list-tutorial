// Add TextEncoder and TextDecoder polyfills
if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder;
}
if (typeof TextDecoder === 'undefined') {
  global.TextDecoder = require('util').TextDecoder;
}

const { update, view, subscriptions } = require('./counter-reset-keyboard');
const { button, div, text } = require('./__mocks__/elmish');
const { describe, it, expect } = require('@jest/globals');

// The mock implementations are in __mocks__/elmish.js
// We don't need to use jest.mock('elmish') here

describe('update function', () => {
  it('should increment the counter', () => {
    expect(update('inc', 0)).toBe(1);
  });

  it('should decrement the counter', () => {
    expect(update('dec', 1)).toBe(0);
  });

  it('should reset the counter to 0', () => {
    expect(update('reset', 5)).toBe(0);
  });

  it('should return the incremented state for a valid action', () => {
    expect(update('inc', 3)).toBe(4);
  });
});

describe('view function', () => {
  it('should render the correct structure', () => {
    const mockSignal = jest.fn(() => () => {});
    const result = view(5, mockSignal);

    expect(result.childNodes.length).toBe(4);

    const countDiv = result.childNodes[1];
    expect(countDiv.childNodes[0].textContent).toBe('5');

    const incrementButton = result.childNodes[0];
    expect(incrementButton.tagName).toBe('BUTTON');
    expect(incrementButton.attributes[0]).toBe('class=inc');

    expect(countDiv.tagName).toBe('DIV');
    expect(countDiv.attributes[0]).toBe('class=count');
  });
});

describe('subscriptions function', () => {
  it('should handle keyup events correctly', () => {
    let actionCalled = '';
    const mockSignal = jest.fn((action) => () => { actionCalled = action; });

    const mockAddEventListener = jest.fn((event, callback) => {
      if (event === 'keyup') {
        callback({ keyCode: 38 }); // Simulate up arrow key
        expect(actionCalled).toBe('inc');

        actionCalled = ''; // Reset actionCalled

        callback({ keyCode: 40 }); // Simulate down arrow key
        expect(actionCalled).toBe('dec');
      }
    });

    // Mock document object
    const originalDocument = global.document;
    global.document = { addEventListener: mockAddEventListener };

    subscriptions(mockSignal);

    expect(mockAddEventListener).toHaveBeenCalledWith('keyup', expect.any(Function));

    // Restore original document
    global.document = originalDocument;
  });
});
