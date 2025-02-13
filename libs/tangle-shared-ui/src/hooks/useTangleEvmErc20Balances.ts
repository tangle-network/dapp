import { BN } from '@polkadot/util';
import { EvmAddress } from '@tangle-network/ui-components/types/address';
import { useCallback } from 'react';
import useViemPublicClient from './useViemPublicClient';
import useAgnosticAccountInfo from './useAgnosticAccountInfo';
import fetchErc20TokenBalance from '../utils/fetchErc20TokenBalance';
import { erc20Abi } from 'viem';
import convertDecimalToBN from '../utils/convertDecimalToBn';
import { BRIDGE_TOKENS } from '../constants/bridge';
import { BridgeToken } from '../types';
import { chainsConfig } from '@tangle-network/dapp-config';
import assert from 'assert';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { assertEvmAddress } from '@tangle-network/ui-components';
import useNetworkStore from '../context/useNetworkStore';
import { NetworkId } from '@tangle-network/ui-components/constants/networks';

type Erc20Token = {
  contractAddress: EvmAddress;
  name: string;
  symbol: string;
  decimals: number;
  networks: NetworkId[];
};

export type Erc20Balance = Erc20Token & {
  balance: BN;
};

type BridgeTokenWithHyperlaneAddress = Omit<
  BridgeToken,
  'hyperlaneSyntheticAddress'
> & {
  hyperlaneSyntheticAddress: EvmAddress;
};

const createErc20Token = (
  bridgeToken: BridgeTokenWithHyperlaneAddress,
): Erc20Token => {
  const chain = chainsConfig[bridgeToken.chainId];

  assert(chain !== undefined, 'Chain not found for bridge token');

  return {
    contractAddress: bridgeToken.hyperlaneSyntheticAddress,
    name: bridgeToken.symbol,
    symbol: bridgeToken.symbol,
    decimals: bridgeToken.decimals,
    networks:
      bridgeToken.isTestnet === true
        ? [NetworkId.TANGLE_TESTNET]
        : [NetworkId.TANGLE_MAINNET],
  };
};

const DEBUGGING_TOKENS: Erc20Token[] = [
  // Testnet EVM: USDC.
  {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 18,
    networks: [NetworkId.TANGLE_TESTNET],
    contractAddress: assertEvmAddress(
      '0xaa49d263845a8280f4ccbcc69c14ed63a36580cd',
    ),
  },
  // Testnet EVM: USDT.
  {
    name: 'Tether',
    symbol: 'USDT',
    decimals: 18,
    networks: [NetworkId.TANGLE_TESTNET],
    contractAddress: assertEvmAddress(
      '0x9794e2f4edc455d1c31ad795d830c58e4c022475',
    ),
  },
  // Local EVM: USDC.
  {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 18,
    networks: [NetworkId.TANGLE_LOCAL_DEV],
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

const getErc20TokensOfNetwork = (networkId: NetworkId): Erc20Token[] => {
  return getAllErc20Tokens().filter((token) =>
    token.networks.includes(networkId),
  );
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
    network: { id: networkId },
  } = useNetworkStore();

  const isReady =
    evmAddress !== null && viemPublicClient !== null && networkId !== undefined;

  const fetchBalances = useCallback(async () => {
    assert(isReady);

    const allTokens = getErc20TokensOfNetwork(networkId);

    const balancePromises = allTokens.map(async (token) => {
      try {
        const balanceDecimal = await fetchErc20TokenBalance(
          viemPublicClient,
          evmAddress,
          token.contractAddress,
          erc20Abi,
          token.decimals,
        );

        if (balanceDecimal === null) {
          return null;
        }

        const balance = convertDecimalToBN(balanceDecimal, token.decimals);

        if (balance.isZero()) {
          return null;
        }

        return {
          ...token,
          balance,
        } satisfies Erc20Balance;
      } catch (error) {
        console.error(`Error fetching balance for ${token.symbol}:`, error);

        return null;
      }
    });

    const results = await Promise.allSettled(balancePromises);

    return results.reduce<Erc20Balance[]>((acc, result) => {
      if (result.status === 'fulfilled' && result.value !== null) {
        acc.push(result.value);
      }

      return acc;
    }, []);
  }, [evmAddress, isReady, networkId, viemPublicClient]);

  // Fetch balances often to keep it in sync with the UI,
  // and also to keep the deposit balance updated (ex. after
  // the user performs a restake deposit).
  const balances = useQuery({
    // Automatically re-fetch when the active account or network
    // changes.
    queryKey: ['tangle-evm-erc20-balances', evmAddress, networkId],
    queryFn: fetchBalances,
    refetchInterval: 12_000,
    enabled: isReady,
  });

  return balances;
};

export default useTangleEvmErc20Balances;
