import { render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router';
import { StakingAction, StakingTab } from '../constants';
import App from './app';

vi.mock('./providers', () => ({
  default: ({ children }: PropsWithChildren) => children,
}));

vi.mock('../containers/Layout', () => ({
  default: ({ children }: PropsWithChildren) => (
    <div data-testid="layout">{children}</div>
  ),
}));

vi.mock('../pages/dashboard', () => ({
  default: () => <div data-testid="dashboard-page" />,
}));

vi.mock('../pages/blueprints', () => ({
  default: () => <div data-testid="blueprints-page" />,
}));

vi.mock('../pages/blueprints/[id]', () => ({
  default: () => <div data-testid="blueprint-details-page" />,
}));

vi.mock('../pages/bridge', () => ({
  default: () => <div data-testid="bridge-page" />,
}));

vi.mock('../pages/claim', () => ({
  default: () => <div data-testid="claim-page" />,
}));

vi.mock('../pages/claim/layout', () => ({
  default: () => <div data-testid="claim-layout" />,
}));

vi.mock('../pages/claim/success', () => ({
  default: () => <div data-testid="claim-success-page" />,
}));

vi.mock('../pages/claim/migration', () => ({
  default: () => <div data-testid="claim-migration-page" />,
}));

vi.mock('../pages/notFound', () => ({
  default: () => <div data-testid="not-found-page" />,
}));

vi.mock('../containers/staking/StakingTabContent', () => ({
  default: ({ tab }: { tab: string }) => (
    <div data-testid="staking-tab-content">{`staking-tab:${tab}`}</div>
  ),
}));

vi.mock('../containers/liquidStaking/LiquidStakingTabContent', () => ({
  default: ({ tab }: { tab: string }) => (
    <div data-testid="liquid-staking-tab-content">{`liquid-staking-tab:${tab}`}</div>
  ),
}));

describe('App', () => {
  const renderAt = (path: string) =>
    render(
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>,
    );

  it.each([
    ['/staking/deposit', StakingAction.DEPOSIT],
    ['/staking/delegate', StakingAction.DELEGATE],
    ['/staking/undelegate', StakingAction.UNDELEGATE],
    ['/staking/withdraw', StakingAction.WITHDRAW],
    ['/staking/rewards', StakingTab.REWARDS],
  ])('renders staking route %s with expected tab', (path, tab) => {
    renderAt(path);

    expect(screen.getByTestId('staking-tab-content').textContent).toBe(
      `staking-tab:${tab}`,
    );
  });

  it('redirects /staking to /staking/deposit', () => {
    renderAt('/staking');

    expect(screen.getByTestId('staking-tab-content').textContent).toBe(
      `staking-tab:${StakingAction.DEPOSIT}`,
    );
  });

  it('renders the claim migration route', () => {
    renderAt('/claim/migration');

    expect(screen.getByTestId('claim-migration-page')).toBeTruthy();
  });

  it('renders not found for unsupported native staking route', () => {
    renderAt('/staking/native');

    expect(screen.getByTestId('not-found-page')).toBeTruthy();
  });
});
