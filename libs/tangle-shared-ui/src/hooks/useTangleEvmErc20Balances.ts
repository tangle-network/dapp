import { BN } from '@polkadot/util';
import { assertEvmAddress } from '@webb-tools/webb-ui-components';
import { EvmAddress } from '@webb-tools/webb-ui-components/types/address';
import { useCallback, useEffect, useState } from 'react';
import { Decimal } from 'decimal.js';
import useViemPublicClient from './useViemPublicClient';
import useAgnosticAccountInfo from './useAgnosticAccountInfo';
import fetchErc20TokenBalance from '../utils/fetchErc20TokenBalance';
import { erc20Abi } from 'viem';
import convertDecimalToBN from '../utils/convertDecimalToBn';

type Erc20Token = {
  contractAddress: EvmAddress;
  name: string;
  symbol: string;
  decimals: number;
};

export type Erc20Balance = Erc20Token & {
  balance: BN;
};

// TODO: Waiting for bridge PR to be implemented in order to list ERC-20 assets here instead of these dummies.
export const ERC20_TEST_TOKENS: Erc20Token[] = [
  {
    name: 'Local ERC-20 Dummy',
    symbol: 'USDC',
    decimals: 18,
    contractAddress: assertEvmAddress(
      '0x2af9b184d0d42cd8d3c4fd0c953a06b6838c9357',
    ),
  },
  {
    name: 'Testnet ERC-20 Dummy',
    symbol: 'USDC',
    decimals: 18,
    contractAddress: assertEvmAddress(
      '0x9794e2f4edc455d1c31ad795d830c58e4c022475',
    ),
  },
];

export const findErc20Token = (id: EvmAddress): Erc20Token | null => {
  return (
    ERC20_TEST_TOKENS.find((token) => token.contractAddress === id) ?? null
  );
};

const useTangleEvmErc20Balances = (): Erc20Balance[] | null => {
  const { evmAddress } = useAgnosticAccountInfo();
  const [balances, setBalances] = useState<Erc20Balance[] | null>(null);
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

  // Fetch balances on mount and whenever the active account changes.
  useEffect(() => {
    // EVM account not connected.
    if (evmAddress === null) {
      setBalances(null);

      return;
    }

    (async () => {
      const newBalances: Erc20Balance[] = [];

      for (const asset of ERC20_TEST_TOKENS) {
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

      setBalances(newBalances);
    })();
  }, [evmAddress, fetchBalance]);

  return balances;
};

export default useTangleEvmErc20Balances;
