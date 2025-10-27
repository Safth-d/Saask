import '@testing-library/jest-dom';

// Polyfill for TextEncoder and TextDecoder
import { TextEncoder, TextDecoder } from 'util';
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}

// Ensure global.fetch is a function
if (typeof global.fetch !== 'function') {
  global.fetch = jest.fn();
}