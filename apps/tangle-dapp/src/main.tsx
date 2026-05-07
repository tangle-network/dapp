// Import global styles first.
import '@tangle-network/ui-components/tailwind.css';
// Opt in to the legacy Cousine + Satoshi WOFF2 bundle. Apps that prefer
// their own font stacks (e.g. tangle-cloud uses Geist via @fontsource)
// skip this import to avoid bundling ~443KB of unused font assets.
import '@tangle-network/ui-components/css/typography-fonts.css';
import './styles.css';

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
