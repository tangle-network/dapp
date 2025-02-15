import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router';
import * as ReactDOM from 'react-dom/client';
import App from './app/app';
import { Buffer } from 'buffer';

// Assign Buffer to globalThis if not already defined.
// This is to satisfy usage of `Buffer` in the UI library
// for legacy code. Ideally, that legacy code should be updated
// or removed.
if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer;
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
