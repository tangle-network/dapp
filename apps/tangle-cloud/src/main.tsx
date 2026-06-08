import '@tangle-network/ui-components/tailwind.css';
import '@tangle-network/ui-components/css/typography-fonts.css';
import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import App from './app/app';
import './styles.css';

type ThemeMode = 'dark' | 'light';

const normalizeTheme = (value: string | null): ThemeMode | null => {
  if (value === 'dark' || value === 'light') {
    return value;
  }

  if (value === null) {
    return null;
  }

  try {
    const parsedValue: unknown = JSON.parse(value);
    return parsedValue === 'dark' || parsedValue === 'light'
      ? parsedValue
      : null;
  } catch {
    return null;
  }
};

const storedTheme = normalizeTheme(window.localStorage.getItem('theme'));
const legacyTheme = normalizeTheme(
  window.localStorage.getItem('tangle-cloud-theme'),
);
const initialTheme = storedTheme ?? legacyTheme ?? 'dark';

if (storedTheme === null && legacyTheme !== null) {
  window.localStorage.setItem('theme', JSON.stringify(legacyTheme));
  window.localStorage.removeItem('tangle-cloud-theme');
}

document.documentElement.classList.toggle('dark', initialTheme === 'dark');
document.documentElement.style.colorScheme = initialTheme;
document.documentElement.setAttribute('data-sandbox-ui', '');
document.documentElement.setAttribute(
  'data-sandbox-theme',
  initialTheme === 'dark' ? 'tangle' : 'vault',
);

// Stale-bundle recovery.
// Every Vite build emits hash-named code-split chunks (assets/page-XYZ.js).
// When a new deploy lands on Netlify, the user's open tab still references
// the OLD hashes. The next route nav triggers a dynamic import for a chunk
// that no longer exists — Netlify SPA-fallbacks to `index.html` for unknown
// paths, the browser tries to load it as a JS module, MIME-type check fails,
// and the route renders blank.
//
// Catch the specific failure shape and reload the page once per session.
// The reload pulls the fresh index.html which references the new hashes.
// Gate by session-storage so a genuine network failure doesn't loop.
const isStaleChunkError = (err: unknown): boolean => {
  if (!(err instanceof Error)) return false;
  const m = err.message ?? '';
  return (
    m.includes('Failed to fetch dynamically imported module') ||
    m.includes('Importing a module script failed') ||
    /Loading chunk \S+ failed/i.test(m)
  );
};
const STALE_RELOAD_FLAG = 'tangle-cloud:stale-chunk-reloaded';
const reloadIfStale = (err: unknown) => {
  if (!isStaleChunkError(err)) return;
  try {
    if (sessionStorage.getItem(STALE_RELOAD_FLAG) === '1') return;
    sessionStorage.setItem(STALE_RELOAD_FLAG, '1');
  } catch {
    // sessionStorage can throw in restricted contexts; reload anyway.
  }
  console.warn(
    '[tangle-cloud] stale code-split chunk detected, reloading for fresh bundle',
  );
  window.location.reload();
};
window.addEventListener('error', (event) => reloadIfStale(event.error));
window.addEventListener('unhandledrejection', (event) =>
  reloadIfStale(event.reason),
);

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
