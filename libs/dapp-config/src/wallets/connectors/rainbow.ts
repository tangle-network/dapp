import { injected } from 'wagmi/connectors';

export default () =>
  injected({
    target: {
      id: 'rainbow',
      name: 'Rainbow',
      provider(window) {
        if (typeof window === 'undefined') {
          return;
        }

        return window.ethereum;
      },
    },
  });
