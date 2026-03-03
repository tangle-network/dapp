import { render, screen } from '@testing-library/react';
import { type PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router';
import App from './app';

vi.mock('./providers', () => ({
  default: ({ children }: PropsWithChildren) => children,
}));

vi.mock('../components/TxHistoryNotifier', () => ({
  default: () => null,
}));

vi.mock(
  '@tangle-network/tangle-shared-ui/components/TxConfirmationModal',
  () => ({
    default: () => null,
  }),
);

describe('App', () => {
  it('renders the not found route without hanging', () => {
    render(
      <MemoryRouter initialEntries={['/route-that-does-not-exist']}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByText('Page Not Found')).toBeTruthy();
  });
});
