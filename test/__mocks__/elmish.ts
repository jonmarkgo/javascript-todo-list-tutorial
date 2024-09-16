import { jest } from '@jest/globals';

// Mock implementations for elmish functions
export const button = jest.fn((attrlist: (string | Function)[], childnodes: Node[]): HTMLButtonElement => ({
  tagName: 'BUTTON',
  attributes: attrlist,
  childNodes: childnodes,
  addEventListener: jest.fn(),
} as unknown as HTMLButtonElement));

export const div = jest.fn((attrlist: (string | Function)[], childnodes: Node[]): HTMLDivElement => ({
  tagName: 'DIV',
  attributes: attrlist,
  childNodes: childnodes,
} as unknown as HTMLDivElement));

export const text = jest.fn((content: string): Text => ({
  textContent: content,
} as unknown as Text));

export const empty = jest.fn((node: Node): void => {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
});

export const mount = jest.fn();

// Mock implementation of document
Object.defineProperty(global, 'document', {
  value: {
    createElement: jest.fn((tag: string) => ({
      tagName: tag.toUpperCase(),
      attributes: {},
      childNodes: [],
      setAttribute: jest.fn(),
      appendChild: jest.fn(),
    })),
    createTextNode: jest.fn((content: string) => ({
      textContent: content,
    })),
    addEventListener: jest.fn(),
  },
  writable: true,
});
