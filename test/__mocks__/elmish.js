// Mock implementations for elmish functions
const button = jest.fn((attrlist, childnodes) => ({
  tagName: 'BUTTON',
  attributes: attrlist,
  childNodes: childnodes,
  addEventListener: jest.fn(),
}));

const div = jest.fn((attrlist, childnodes) => ({
  tagName: 'DIV',
  attributes: attrlist,
  childNodes: childnodes,
}));

const text = jest.fn((content) => ({
  textContent: content,
}));

const empty = jest.fn((node) => {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
});

const mount = jest.fn();

// Additional mock functions
const a = jest.fn();
const footer = jest.fn();
const input = jest.fn();
const h1 = jest.fn();
const header = jest.fn();
const label = jest.fn();
const li = jest.fn();
const route = jest.fn();
const section = jest.fn();
const span = jest.fn();
const strong = jest.fn();
const ul = jest.fn();

// Mock implementation of document
global.document = {
  createElement: jest.fn((tag) => ({
    tagName: tag.toUpperCase(),
    attributes: {},
    childNodes: [],
    setAttribute: jest.fn(),
    appendChild: jest.fn(),
  })),
  createTextNode: jest.fn((content) => ({
    textContent: content,
  })),
  addEventListener: jest.fn(),
};

module.exports = {
  a,
  button,
  div,
  empty,
  footer,
  input,
  h1,
  header,
  label,
  li,
  mount,
  route,
  section,
  span,
  strong,
  text,
  ul,
};
