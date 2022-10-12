import { randFloat, randNumber } from '@ngneat/falso';
import { ChainListCard, RelayerListCard, TitleWithInfo } from '@webb-dapp/webb-ui-components/components';
import { ArrayElement } from '@webb-dapp/webb-ui-components/types';
import { arrayFrom } from '@webb-dapp/webb-ui-components/utils';
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

const getRelayer = (): ArrayElement<ComponentProps<typeof RelayerListCard>['relayers']> => {
  return {
    address: '5GrpknVvGGrGH3EFuURXeMrWHvbpj3VfER1oX5jFtuGbfzCE',
    externalUrl: 'https://webb.tools',
    fee: randFloat(),
    percentage: randNumber({ min: 20, max: 90 }),
  };
};

const relayers = arrayFrom(randNumber({ min: 10, max: 20 }), () => getRelayer());

export const ListCardsShowcase = () => {
  return (
    <>
      <TitleWithInfo title='List Cards' variant='h4' />
      <div className='grid items-start grid-cols-2 gap-4 justify-items-center'>
        <ChainListCard chainType='source' chains={chains} />
        <ChainListCard chainType='dest' chains={chains} />
        <RelayerListCard relayers={relayers} />
        <RelayerListCard relayers={relayers} isDisconnected />
      </div>
    </>
  );
};
