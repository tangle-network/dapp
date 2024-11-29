import { act, render } from '@testing-library/react';

import Page from './page';

describe('Claim Page', () => {
  it('renders without crashing', async () => {
    let container;
    await act(async () => {
      const result = render(<Page />);
      container = result.container;
    });
    expect(container).toBeInTheDocument();
  });
});
