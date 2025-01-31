import { BN } from '@polkadot/util';
import { EvmAddress } from '@webb-tools/webb-ui-components/types/address';
import { useCallback } from 'react';
import { Decimal } from 'decimal.js';
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

type Erc20Token = {
  contractAddress: EvmAddress;
  name: string;
  symbol: string;
  decimals: number;
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
  };
};

const getAllErc20Tokens = (): Erc20Token[] => {
  // Filter out duplicate tokens.
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
    .filter((token) => {
      if (seen.has(token.contractAddress)) {
        return false;
      }

      seen.add(token.contractAddress);

      return true;
    });
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

  const fetchBalance = useCallback(
    async (
      evmAddress: EvmAddress,
      token: Erc20Token,
    ): Promise<Decimal | null> => {
      if (viemPublicClient === null) {
        return null;
      }

      return fetchErc20TokenBalance(
        viemPublicClient,
        evmAddress,
        token.contractAddress,
        erc20Abi,
        token.decimals,
      );
    },
    [viemPublicClient],
  );

  const fetchBalances = useCallback(async () => {
    // EVM account not connected.
    if (evmAddress === null) {
      return null;
    }

    const newBalances: Erc20Balance[] = [];
    const allTokens = getAllErc20Tokens();

    for (const asset of allTokens) {
      const balanceDecimal = await fetchBalance(evmAddress, asset);

      if (balanceDecimal === null) {
        continue;
      }

      const balance = convertDecimalToBN(balanceDecimal, asset.decimals);

      // Ignore assets that have a zero balance.
      if (balance.isZero()) {
        continue;
      }

      newBalances.push({
        ...asset,
        balance,
      } satisfies Erc20Balance);
    }

    return newBalances;
  }, [evmAddress, fetchBalance]);

  // Fetch balances often to keep it in sync with the UI,
  // and also to keep the deposit balance updated (ex. after
  // the user performs a restake deposit).
  const balances = useQuery({
    queryKey: ['tangle-evm-erc20-balances', evmAddress],
    queryFn: fetchBalances,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    enabled: evmAddress !== null,
    retry: true,
  });

  return balances;
};

export default useTangleEvmErc20Balances;
