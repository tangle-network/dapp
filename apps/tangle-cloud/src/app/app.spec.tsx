import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import App from './app';

/**
 * TODO: Investigate why this test is hanging
 */
describe('App', { skip: true }, () => {
  it('should render successfully', async () => {
    const { baseElement } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );

    const container = baseElement;

    expect(container).toBeTruthy();
  });
});
