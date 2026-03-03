import { render, screen } from '@testing-library/react';
import { type PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router';
import App from './app';

vi.mock('../components/Layout', () => ({
  default: ({ children }: PropsWithChildren) => (
    <div data-testid="layout">{children}</div>
  ),
}));

vi.mock('./providers', () => ({
  default: ({ children }: PropsWithChildren) => children,
}));

vi.mock('../pages/instances/layout', () => ({
  default: ({ children }: PropsWithChildren) => (
    <div data-testid="instances-layout">{children}</div>
  ),
}));

vi.mock('../pages/instances/page', () => ({
  default: () => <div data-testid="instances-page" />,
}));

vi.mock('../pages/services/[id]/page', () => ({
  default: () => <div data-testid="service-details-page" />,
}));

vi.mock('../pages/blueprints/layout', () => ({
  default: ({ children }: PropsWithChildren) => (
    <div data-testid="blueprints-layout">{children}</div>
  ),
}));

vi.mock('../pages/blueprints/page', () => ({
  default: () => <div data-testid="blueprints-page" />,
}));

vi.mock('../pages/blueprints/[id]/page', () => ({
  default: () => <div data-testid="blueprint-details-page" />,
}));

vi.mock('../pages/blueprints/[id]/deploy/page', () => ({
  default: () => <div data-testid="blueprint-deploy-page" />,
}));

vi.mock('../pages/blueprints/create/page', () => ({
  default: () => <div data-testid="create-blueprint-page" />,
}));

vi.mock('../pages/blueprints/manage/page', () => ({
  default: () => <div data-testid="manage-blueprints-page" />,
}));

vi.mock('../pages/operators/layout', () => ({
  default: ({ children }: PropsWithChildren) => (
    <div data-testid="operators-layout">{children}</div>
  ),
}));

vi.mock('../pages/operators/page', () => ({
  default: () => <div data-testid="operators-page" />,
}));

vi.mock('../pages/operators/manage/layout', () => ({
  default: ({ children }: PropsWithChildren) => (
    <div data-testid="operators-manage-layout">{children}</div>
  ),
}));

vi.mock('../pages/operators/manage/page', () => ({
  default: () => <div data-testid="operators-manage-page" />,
}));

vi.mock('../pages/rewards/layout', () => ({
  default: ({ children }: PropsWithChildren) => (
    <div data-testid="rewards-layout">{children}</div>
  ),
}));

vi.mock('../pages/rewards/page', () => ({
  default: () => <div data-testid="rewards-page" />,
}));

vi.mock('../pages/earnings/layout', () => ({
  default: ({ children }: PropsWithChildren) => (
    <div data-testid="earnings-layout">{children}</div>
  ),
}));

vi.mock('../pages/earnings/page', () => ({
  default: () => <div data-testid="earnings-page" />,
}));

vi.mock('../pages/notFound', () => ({
  default: () => <div data-testid="not-found-page">Page Not Found</div>,
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
  const renderAt = (path: string) =>
    render(
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>,
    );

  it.each([
    ['/instances', 'instances-layout', 'instances-page'],
    ['/services/service-1', 'instances-layout', 'service-details-page'],
    ['/blueprints', 'blueprints-layout', 'blueprints-page'],
    ['/blueprints/42', 'blueprints-layout', 'blueprint-details-page'],
    ['/blueprints/42/deploy', 'blueprints-layout', 'blueprint-deploy-page'],
    ['/blueprints/create', 'blueprints-layout', 'create-blueprint-page'],
    ['/blueprints/manage', 'blueprints-layout', 'manage-blueprints-page'],
    ['/operators', 'operators-layout', 'operators-page'],
    ['/operators/manage', 'operators-manage-layout', 'operators-manage-page'],
    ['/rewards', 'rewards-layout', 'rewards-page'],
    ['/earnings', 'earnings-layout', 'earnings-page'],
  ])(
    'renders cloud route %s with expected layout/page',
    (path, layoutTestId, pageTestId) => {
      renderAt(path);

      expect(screen.getByTestId(layoutTestId)).toBeTruthy();
      expect(screen.getByTestId(pageTestId)).toBeTruthy();
    },
  );

  it('redirects legacy registration review route to blueprints', () => {
    renderAt('/registration-review');

    expect(screen.getByTestId('blueprints-layout')).toBeTruthy();
    expect(screen.getByTestId('blueprints-page')).toBeTruthy();
  });

  it('renders the not found route without hanging', () => {
    renderAt('/route-that-does-not-exist');

    expect(screen.getByTestId('not-found-page')).toBeTruthy();
    expect(screen.getByText('Page Not Found')).toBeTruthy();
  });

  it('redirects root route to instances', () => {
    renderAt('/');

    expect(screen.getByTestId('instances-layout')).toBeTruthy();
    expect(screen.getByTestId('instances-page')).toBeTruthy();
  });
});
