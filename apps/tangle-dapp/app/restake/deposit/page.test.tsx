import { act, render } from '@testing-library/react';

import { mockMatchMedia } from '../../test-utils';
import Page from './page';

describe('Deposit Page', () => {
  beforeAll(() => {
    mockMatchMedia();
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
