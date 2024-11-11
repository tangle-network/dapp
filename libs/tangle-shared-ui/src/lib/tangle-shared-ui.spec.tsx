import { render } from '@testing-library/react';

import TangleSharedUi from './tangle-shared-ui';

describe('TangleSharedUi', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TangleSharedUi />);
    expect(baseElement).toBeTruthy();
  });
});
