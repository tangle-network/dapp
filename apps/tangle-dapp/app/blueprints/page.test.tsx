import { act, render } from '@testing-library/react';
import { PolkadotApiProvider } from '@webb-tools/tangle-shared-ui/context/PolkadotApiContext';

import { RestakeContextProvider } from '../../context/RestakeContext';
import { mockMatchMedia } from '../test-utils';
import Page from './page';

describe('Blueprints Page', () => {
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
        <PolkadotApiProvider>
          <RestakeContextProvider>
            <Page />
          </RestakeContextProvider>
        </PolkadotApiProvider>,
      );
      container = result.container;
    });
    expect(container).toBeInTheDocument();
  });
});
