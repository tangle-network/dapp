import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router';

import App from './app';
import { act } from 'react';

describe('App', () => {
  it('should render successfully', async () => {
    let container;

    await act(async () => {
      const { baseElement } = render(
        <BrowserRouter>
          <App />
        </BrowserRouter>,
      );

      container = baseElement;
    });

    expect(container).toBeTruthy();
  });
});
