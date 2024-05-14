import dynamic from 'next/dynamic.js';

export const Identicon = dynamic(() => import('@polkadot/react-identicon'), {
  ssr: false,
});
