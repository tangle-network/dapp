import {
  Network,
  NetworkId,
} from '@webb-tools/webb-ui-components/constants/networks';
import { Chain } from 'viem';

import { TangleTokenSymbol } from '../../types';

const createTangleViemChainFromNetwork = (
  network: Network & { evmChainId: number; httpRpcEndpoint: string },
): Chain => {
  const currencyName =
    network.id === NetworkId.TANGLE_MAINNET
      ? 'Tangle Network Token'
      : 'Test Tangle Network Token';

  const tokenSymbol: TangleTokenSymbol =
    network.id === NetworkId.TANGLE_MAINNET ? 'TNT' : 'tTNT';

  const blockExplorerName =
    network.id === NetworkId.TANGLE_MAINNET
      ? 'Tangle EVM Explorer'
      : 'Tangle Testnet EVM Explorer';

  return {
    id: network.evmChainId,
    name: network.name,
    nativeCurrency: {
      name: currencyName,
      symbol: tokenSymbol,
      decimals: 18,
    },
    blockExplorers: network.evmExplorerUrl
      ? {
          default: {
            name: blockExplorerName,
            url: network.evmExplorerUrl,
          },
        }
      : undefined,
    rpcUrls: {
      default: {
        http: [network.httpRpcEndpoint],
      },
      public: {
        http: [network.httpRpcEndpoint],
      },
    },
    fees: {
      /**
       * Follow the default medium priority fee of Metamask
       * @see https://github.com/MetaMask/core/blob/95d02fae36ab4229069e6dccf0dd9c27b8e60a99/packages/gas-fee-controller/src/fetchGasEstimatesViaEthFeeHistory/calculateGasFeeEstimatesForPriorityLevels.ts#L29
       */
      defaultPriorityFee: BigInt(1_500_000_000),
    },
  };
};

export default createTangleViemChainFromNetwork;
