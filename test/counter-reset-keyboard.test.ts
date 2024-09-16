import { update, view, subscriptions, Action, Model } from './counter-reset-keyboard';
import { button, div, text } from './__mocks__/elmish';
import { jest, describe, it, expect } from '@jest/globals';

// The mock implementations are in __mocks__/elmish.ts
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
    const mockSignal = jest.fn((action: Action) => () => {});
    const result = view(5, mockSignal);

    expect(result.childNodes.length).toBe(4);

    const countDiv = result.childNodes[1] as ReturnType<typeof div>;
    expect(countDiv.childNodes[0].textContent).toBe('5');

    const incrementButton = result.childNodes[0] as ReturnType<typeof button>;
    expect(incrementButton.tagName).toBe('BUTTON');
    expect(incrementButton.attributes[0]).toBe('class=inc');

    expect(countDiv.tagName).toBe('DIV');
    expect(countDiv.attributes[0]).toBe('class=count');
  });
});

describe('subscriptions function', () => {
  it('should handle keyup events correctly', () => {
    let actionCalled: Action | null = null;
    const mockSignal = jest.fn((action: Action) => () => { actionCalled = action; });

    const mockAddEventListener = jest.fn((event: string, callback: (e: KeyboardEvent) => void) => {
      if (event === 'keyup') {
        callback({ keyCode: 38 } as KeyboardEvent); // Simulate up arrow key
        expect(actionCalled).toBe('inc');

        actionCalled = null; // Reset actionCalled

        callback({ keyCode: 40 } as KeyboardEvent); // Simulate down arrow key
        expect(actionCalled).toBe('dec');
      }
    });

    // Mock document object
    const originalDocument = global.document;
    global.document = { addEventListener: mockAddEventListener } as unknown as Document;

    subscriptions(mockSignal);

    expect(mockAddEventListener).toHaveBeenCalledWith('keyup', expect.any(Function));

    // Restore original document
    global.document = originalDocument;
  });
});
