import { act, render } from '@testing-library/react';

import Providers from '../providers';
import { mockMatchMedia } from '../test-utils';
import Page from './page';

describe('Nomination Page', () => {
  beforeAll(() => {
    mockMatchMedia();

    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ country_code: 'US', state: 'CA' }),
      }),
    );
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    let container;
    await act(async () => {
      const result = render(
        <Providers>
          <Page />
        </Providers>,
      );
      container = result.container;
    });
    expect(container).toBeInTheDocument();
  });
});
