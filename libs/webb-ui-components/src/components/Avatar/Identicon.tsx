import dynamic from 'next/dynamic';

export const Identicon = dynamic(() => import('@polkadot/react-identicon'), {
  ssr: false,
});
