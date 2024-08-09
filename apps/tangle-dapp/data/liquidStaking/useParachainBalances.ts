'use client';

// This will override global types and provide type definitions for
// the Tangle Restaking Parachain's pallets and extrinsics.
import '@webb-tools/tangle-restaking-types';

import { BN } from '@polkadot/util';
import { TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';
import { useCallback, useMemo } from 'react';

import useApiRx from '../../hooks/useApiRx';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import { LiquidStakingToken } from '../../types/liquidStaking';
import isLiquidStakingToken from '../../utils/liquidStaking/isLiquidStakingToken';

const useParachainBalances = () => {
  const activeSubstrateAddress = useSubstrateAddress();

  const { result: rawBalances } = useApiRx(
    useCallback(
      (api) => {
        if (activeSubstrateAddress === null) {
          return null;
        }

        return api.query.tokens.accounts.entries(activeSubstrateAddress);
      },
      [activeSubstrateAddress],
    ),
    TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.wsRpcEndpoint,
  );

  const balances = useMemo(() => {
    if (rawBalances === null) {
      return null;
    }

    const nativeBalances = new Map<LiquidStakingToken, BN>();
    const liquidBalances = new Map<LiquidStakingToken, BN>();

    for (const encodedBalance of rawBalances) {
      // TODO: Need proper typing, ideally linked to Restaking Parachain's types. This is currently very hacky.
      const entry = encodedBalance[0].args[1].toJSON() as Record<
        'lst' | 'Native',
        string | undefined
      >;

      // TODO: 'Native' balance isn't showing up on the parachain for some reason, not even under `api.query.balances.account()`. Is this a bug? Currently unable to obtain user account's native balance (defaulting to 0). Is it due to some sort of bridging mechanism?
      const entryTokenValue = entry.lst ?? entry.Native;

      // Irrelevant entry, skip.
      if (
        entryTokenValue === undefined ||
        !isLiquidStakingToken(entryTokenValue)
      ) {
        continue;
      }

      const isLiquid = entry.lst !== undefined;
      const balance = encodedBalance[1].free.toBn();

      if (isLiquid) {
        liquidBalances.set(entryTokenValue, balance);
      } else {
        nativeBalances.set(entryTokenValue, balance);
      }
    }

    return [nativeBalances, liquidBalances] as const;
  }, [rawBalances]);

  return {
    nativeBalances: balances?.[0] ?? null,
    liquidBalances: balances?.[1] ?? null,
  };
};

export default useParachainBalances;
