import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';

// TODO: Remove this once we upgrade to Node.js
global.TextDecoder = TextDecoder as any;
global.TextEncoder = TextEncoder as any;
