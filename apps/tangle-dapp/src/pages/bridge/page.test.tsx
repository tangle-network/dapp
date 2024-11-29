import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render } from '@testing-library/react';

import BridgeProvider from '../../context/BridgeContext';
import { mockMatchMedia } from '../test-utils';
import Page from './page';

const queryClient = new QueryClient();

describe('Bridge Page', () => {
  beforeAll(() => {
    mockMatchMedia();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    let container;
    await act(async () => {
      const result = render(
        <QueryClientProvider client={queryClient}>
          <BridgeProvider>
            <Page />
          </BridgeProvider>
        </QueryClientProvider>,
      );
      container = result.container;
    });
    expect(container).toBeInTheDocument();
  });
});
