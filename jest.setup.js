// Add any global setup for Jest tests here
require('@testing-library/jest-dom');

// If you need to mock global objects or add polyfills, do it here
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Setup a basic document structure for JSDOM
document.body.innerHTML = '<div id="test-app"></div>';
