import {
  Network,
  NetworkId,
} from '@webb-tools/webb-ui-components/constants/networks';
import { Chain } from 'viem';

const createTangleViemChainFromNetwork = (
  network: Network & { chainId: number; httpRpcEndpoint: string }
): Chain => {
  const currencyName =
    network.id === NetworkId.TANGLE_MAINNET
      ? 'Tangle Network Token'
      : 'Test Tangle Network Token';

  const currencySymbol =
    network.id === NetworkId.TANGLE_MAINNET ? 'TNT' : 'tTNT';

  const blockExplorerName =
    network.id === NetworkId.TANGLE_MAINNET
      ? 'Tangle EVM Explorer'
      : 'Tangle Testnet EVM Explorer';

  return {
    id: network.chainId,
    name: network.name,
    nativeCurrency: {
      name: currencyName,
      symbol: currencySymbol,
      decimals: 18,
    },
    blockExplorers: {
      default: {
        name: blockExplorerName,
        url: network.evmExplorerUrl,
      },
    },
    rpcUrls: {
      default: {
        http: [network.httpRpcEndpoint],
      },
      public: {
        http: [network.httpRpcEndpoint],
      },
    },
  };
};

export default createTangleViemChainFromNetwork;
