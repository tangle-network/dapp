import { BN } from '@polkadot/util';
import { EvmAddress } from '@webb-tools/webb-ui-components/types/address';
import { useCallback } from 'react';
import useViemPublicClient from './useViemPublicClient';
import useAgnosticAccountInfo from './useAgnosticAccountInfo';
import fetchErc20TokenBalance from '../utils/fetchErc20TokenBalance';
import { erc20Abi } from 'viem';
import convertDecimalToBN from '../utils/convertDecimalToBn';
import { BRIDGE_TOKENS } from '../constants/bridge';
import { BridgeToken } from '../types';
import { chainsConfig } from '@webb-tools/dapp-config';
import assert from 'assert';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { assertEvmAddress } from '@webb-tools/webb-ui-components';
import useNetworkStore from '../context/useNetworkStore';
import {
  TANGLE_LOCAL_DEV_NETWORK,
  TANGLE_TESTNET_NATIVE_NETWORK,
} from '@webb-tools/webb-ui-components/constants/networks';

type Erc20Token = {
  contractAddress: EvmAddress;
  name: string;
  symbol: string;
  decimals: number;
  chainId: number;
};

export type Erc20Balance = Erc20Token & {
  balance: BN;
};

const createErc20Token = (bridgeToken: Required<BridgeToken>): Erc20Token => {
  const chain = chainsConfig[bridgeToken.chainId];

  assert(chain !== undefined, 'Chain not found for bridge token');

  return {
    contractAddress: bridgeToken.hyperlaneSyntheticAddress,
    name: chain.name,
    symbol: bridgeToken.symbol,
    decimals: bridgeToken.decimals,
    chainId: bridgeToken.chainId,
  };
};

const DEBUGGING_TOKENS: Erc20Token[] = [
  // Testnet EVM: USDC.
  {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 18,
    chainId: TANGLE_TESTNET_NATIVE_NETWORK.evmChainId,
    contractAddress: assertEvmAddress(
      '0xaa49d263845a8280f4ccbcc69c14ed63a36580cd',
    ),
  },
  // Testnet EVM: USDT.
  {
    name: 'Tether',
    symbol: 'USDT',
    decimals: 18,
    chainId: TANGLE_TESTNET_NATIVE_NETWORK.evmChainId,
    contractAddress: assertEvmAddress(
      '0x9794e2f4edc455d1c31ad795d830c58e4c022475',
    ),
  },
  // Local EVM: USDC.
  {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 18,
    chainId: TANGLE_LOCAL_DEV_NETWORK.evmChainId,
    contractAddress: assertEvmAddress(
      '0x2af9b184d0d42cd8d3c4fd0c953a06b6838c9357',
    ),
  },
];

const getAllErc20Tokens = (): Erc20Token[] => {
  const seen = new Set<EvmAddress>();

  return Object.values(BRIDGE_TOKENS)
    .flat()
    .flatMap((token) => {
      const hyperlaneSyntheticAddress = token.hyperlaneSyntheticAddress;

      if (hyperlaneSyntheticAddress === undefined) {
        return [];
      }

      return createErc20Token({ ...token, hyperlaneSyntheticAddress });
    })
    .concat(DEBUGGING_TOKENS)
    .filter((token) => {
      if (seen.has(token.contractAddress)) {
        return false;
      }

      seen.add(token.contractAddress);

      return true;
    });
};

const getErc20TokensOfChain = (chainId: number): Erc20Token[] => {
  return getAllErc20Tokens().filter((token) => token.chainId === chainId);
};

export const findErc20Token = (id: EvmAddress): Erc20Token | null => {
  return (
    getAllErc20Tokens().find((token) => token.contractAddress === id) ?? null
  );
};

const useTangleEvmErc20Balances = (): UseQueryResult<
  Erc20Balance[] | null,
  Error
> => {
  const { evmAddress } = useAgnosticAccountInfo();
  const viemPublicClient = useViemPublicClient();

  const {
    network: { evmChainId },
  } = useNetworkStore();

  const isReady =
    evmAddress !== null &&
    viemPublicClient !== null &&
    evmChainId !== undefined;

  const fetchBalances = useCallback(async () => {
    assert(isReady);

    const newBalances: Erc20Balance[] = [];
    const allTokens = getErc20TokensOfChain(evmChainId);

    for (const token of allTokens) {
      const balanceDecimal = await fetchErc20TokenBalance(
        viemPublicClient,
        evmAddress,
        token.contractAddress,
        erc20Abi,
        token.decimals,
      );

      if (balanceDecimal === null) {
        continue;
      }

      const balance = convertDecimalToBN(balanceDecimal, token.decimals);

      // Ignore assets that have a zero balance.
      if (balance.isZero()) {
        continue;
      }

      newBalances.push({
        ...token,
        balance,
      } satisfies Erc20Balance);
    }

    return newBalances;
  }, [evmAddress, evmChainId, isReady, viemPublicClient]);

  // Fetch balances often to keep it in sync with the UI,
  // and also to keep the deposit balance updated (ex. after
  // the user performs a restake deposit).
  const balances = useQuery({
    queryKey: ['tangle-evm-erc20-balances', evmAddress, evmChainId],
    queryFn: fetchBalances,
    enabled: isReady,
  });

  return balances;
};

export default useTangleEvmErc20Balances;
