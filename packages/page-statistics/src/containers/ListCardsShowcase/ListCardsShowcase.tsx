import { ChainListCard, TitleWithInfo } from '@webb-dapp/webb-ui-components/components';
import { ComponentProps } from 'react';

const chains: ComponentProps<typeof ChainListCard>['chains'] = [
  {
    name: 'Ethereum',
    symbol: 'eth',
  },
  {
    name: 'Avalanche',
    symbol: 'avax',
  },
  {
    name: 'Optimism',
    symbol: 'op',
  },
  {
    name: 'Kusama',
    symbol: 'ksm',
  },
  {
    name: 'Polkadot',
    symbol: 'dot',
  },
  {
    name: 'Polygon',
    symbol: 'matic',
  },
  {
    name: 'Arbitrum',
    symbol: 'arbitrum',
  },
  {
    name: 'Harmony',
    symbol: 'one',
  },
  {
    name: 'Near Protocol',
    symbol: 'near',
  },
  {
    name: 'Near Protocol 1',
    symbol: 'near',
  },
  {
    name: 'Near Protocol 2',
    symbol: 'near',
  },
  {
    name: 'Webb Dev',
    symbol: 'webbdev',
  },
];

export const ListCardsShowcase = () => {
  return (
    <>
      <TitleWithInfo title='List Cards' variant='h4' />
      <div className='flex space-x-4'>
        <ChainListCard chainType='source' chains={chains} />
        <ChainListCard chainType='dest' chains={chains} />
      </div>
    </>
  );
};
