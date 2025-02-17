import { render } from '@testing-library/react';
import { act } from 'react';
import { BrowserRouter } from 'react-router';
import App from './app';

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
