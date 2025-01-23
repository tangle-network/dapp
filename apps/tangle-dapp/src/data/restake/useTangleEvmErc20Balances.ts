import { BN } from '@polkadot/util';
import { assertEvmAddress } from '@webb-tools/webb-ui-components';
import { EvmAddress } from '@webb-tools/webb-ui-components/types/address';
import fetchErc20TokenBalance from '../../utils/fetchErc20TokenBalance';
import useAgnosticAccountInfo from '../../hooks/useAgnosticAccountInfo';
import { useCallback, useEffect, useState } from 'react';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { PresetTypedChainId } from '@webb-tools/dapp-types';
import ERC20_ABI from '../../abi/erc20';
import { Decimal } from 'decimal.js';

type Erc20Token = {
  contractAddress: EvmAddress;
  name: string;
  symbol: string;
  decimals: number;
};

export type Erc20Balance = Erc20Token & {
  balance: BN;
};

// TODO: Query from EVM instead of being hard-coded. Waiting for bridge to be implemented in order to do that.
export const ERC20_TEST_TOKENS: Erc20Token[] = [
  {
    name: 'ERC-20 Testcoin',
    symbol: 'ETST',
    decimals: 18,
    contractAddress: assertEvmAddress(
      '0xd38790743B49bbB8E5AF03A94029DA04aaFa262b',
    ),
  },
];

export const findErc20Token = (id: EvmAddress): Erc20Token | null => {
  return (
    ERC20_TEST_TOKENS.find((token) => token.contractAddress === id) ?? null
  );
};

const useTangleEvmErc20Balances = (): Erc20Balance[] | null => {
  const { apiConfig } = useWebContext();
  const { evmAddress } = useAgnosticAccountInfo();
  const [balances, setBalances] = useState<Erc20Balance[] | null>(null);

  const chain = apiConfig.chains[PresetTypedChainId.TangleLocalEVM];

  const fetchBalance = useCallback(
    async (
      evmAddress: EvmAddress,
      token: Erc20Token,
    ): Promise<Decimal | null> => {
      return fetchErc20TokenBalance(
        evmAddress,
        chain.id,
        token.contractAddress,
        ERC20_ABI,
        token.decimals,
      );
    },
    [chain.id],
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
        const balance = await fetchBalance(evmAddress, asset);

        if (balance === null) {
          continue;
        }

        const scaledBalance = new BN(balance.toString()).mul(
          new BN(10).pow(new BN(asset.decimals)),
        );

        newBalances.push({
          ...asset,
          balance: scaledBalance,
        } satisfies Erc20Balance);
      }

      setBalances(newBalances);
    })();
  }, [evmAddress, fetchBalance]);

  return balances;
};

export default useTangleEvmErc20Balances;
