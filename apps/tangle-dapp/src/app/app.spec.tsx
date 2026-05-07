import { render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router';
import {
  LiquidStakingAction,
  LiquidStakingTab,
  StakingAction,
  StakingTab,
} from '../constants';
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

  it('renders dashboard on root path', () => {
    renderAt('/');

    expect(screen.getByTestId('dashboard-page')).toBeTruthy();
  });

  it('renders canonical claim route', async () => {
    renderAt('/claim');

    expect(await screen.findByTestId('claim-migration-page')).toBeTruthy();
  });

  it('renders blueprint routes', async () => {
    renderAt('/blueprints');
    expect(await screen.findByTestId('blueprints-page')).toBeTruthy();

    renderAt('/blueprints/42');
    expect(await screen.findByTestId('blueprint-details-page')).toBeTruthy();
  });

  it.each([
    ['/staking/deposit', StakingAction.DEPOSIT],
    ['/staking/delegate', StakingAction.DELEGATE],
    ['/staking/undelegate', StakingAction.UNDELEGATE],
    ['/staking/withdraw', StakingAction.WITHDRAW],
    ['/staking/vaults', StakingTab.VAULTS],
    ['/staking/operators', StakingTab.OPERATORS],
    ['/staking/blueprints', StakingTab.BLUEPRINTS],
    ['/staking/rewards', StakingTab.REWARDS],
  ])('renders staking route %s with expected tab', async (path, tab) => {
    renderAt(path);

    expect((await screen.findByTestId('staking-tab-content')).textContent).toBe(
      `staking-tab:${tab}`,
    );
  });

  it('redirects /staking to /staking/deposit', async () => {
    renderAt('/staking');

    expect((await screen.findByTestId('staking-tab-content')).textContent).toBe(
      `staking-tab:${StakingAction.DEPOSIT}`,
    );
  });

  it.each([
    ['/liquid-staking/deposit', LiquidStakingAction.DEPOSIT],
    ['/liquid-staking/redeem', LiquidStakingAction.REDEEM],
    ['/liquid-staking/create-vault', LiquidStakingAction.CREATE_VAULT],
    ['/liquid-staking/vaults', LiquidStakingTab.VAULTS],
    ['/liquid-staking/positions', LiquidStakingTab.POSITIONS],
  ])('renders liquid staking route %s with expected tab', async (path, tab) => {
    renderAt(path);

    expect(
      (await screen.findByTestId('liquid-staking-tab-content')).textContent,
    ).toBe(`liquid-staking-tab:${tab}`);
  });

  it('redirects /liquid-staking to /liquid-staking/deposit', async () => {
    renderAt('/liquid-staking');

    expect(
      (await screen.findByTestId('liquid-staking-tab-content')).textContent,
    ).toBe(`liquid-staking-tab:${LiquidStakingAction.DEPOSIT}`);
  });

  it('redirects legacy claim migration route to canonical claim route', async () => {
    renderAt('/claim/migration');

    expect(await screen.findByTestId('claim-migration-page')).toBeTruthy();
  });

  it('renders not found for unsupported native staking route', async () => {
    renderAt('/staking/native');

    expect(await screen.findByTestId('not-found-page')).toBeTruthy();
  });

  it('renders not found for unknown route', () => {
    renderAt('/route-that-does-not-exist');

    expect(screen.getByTestId('not-found-page')).toBeTruthy();
  });
});
