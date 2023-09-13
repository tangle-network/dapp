import type { WebbProviderType } from '@webb-tools/abstract-api-provider';

export const getExplorerURI = (
  explorerUri: string,
  addOrTxHash: string,
  variant: 'tx' | 'address',
  txProviderType: WebbProviderType
): URL => {
  switch (txProviderType) {
    case 'web3':
      return new URL(`${variant}/${addOrTxHash}`, explorerUri);

    case 'polkadot': {
      const path = variant === 'tx' ? `explorer/query/${addOrTxHash}` : '';
      return new URL(`${path}`, explorerUri);
    }

    default:
      return new URL('');
  }
};

export default getExplorerURI;
