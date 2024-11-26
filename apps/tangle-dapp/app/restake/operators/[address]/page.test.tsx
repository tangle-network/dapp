import { act, render } from '@testing-library/react';

import { mockMatchMedia } from '../../test-utils';
import Page from './page';

const address = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

describe('Operators Page', () => {
  beforeAll(() => {
    mockMatchMedia();
  });

  it('renders without crashing', async () => {
    let container;
    await act(async () => {
      const result = render(
        <Page
          params={{
            address,
          }}
        />,
      );
      container = result.container;
    });
    expect(container).toBeInTheDocument();
  });
});
