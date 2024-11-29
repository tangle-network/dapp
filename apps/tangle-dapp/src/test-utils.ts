import { vi } from 'vitest'; // Using vitest instead of jest

// Mock React Router
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({
    pathname: '/',
    search: '',
    hash: '',
    state: null,
  }),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
}));

// Mock window.matchMedia
export function mockMatchMedia() {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// Mock fetch with type safety
interface MockFetchOptions {
  ok?: boolean;
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
}

export function mockFetch<T>(data: T, options: MockFetchOptions = {}) {
  const { ok = true, status = 200, statusText = 'OK', headers = {} } = options;

  Object.defineProperty(window, 'fetch', {
    writable: true,
    value: vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok,
        status,
        statusText,
        headers: new Headers(headers),
        json: () => Promise.resolve(data),
      }),
    ),
  });
}

// Helper to create a mock response
export function createMockResponse<T>(data: T, options: MockFetchOptions = {}) {
  return {
    ok: options.ok ?? true,
    status: options.status ?? 200,
    statusText: options.statusText ?? 'OK',
    headers: new Headers(options.headers ?? {}),
    json: () => Promise.resolve(data),
  };
}

// Reset all mocks between tests
export function resetMocks() {
  vi.resetAllMocks();
  window.fetch = global.fetch;
}
