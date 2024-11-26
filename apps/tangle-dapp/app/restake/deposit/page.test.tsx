import { act, render } from '@testing-library/react';

import Page from './page';

// Mock useRouter, usePathname, and useSearchParams
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
    };
  },
  usePathname: () => '/restake/deposit',

  useSearchParams: () => new URLSearchParams(),
}));

describe('Deposit Page', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // Deprecated
        removeListener: jest.fn(), // Deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  it('renders without crashing', async () => {
    let container;
    await act(async () => {
      const result = render(<Page />);
      container = result.container;
    });
    expect(container).toBeInTheDocument();
  });
});
