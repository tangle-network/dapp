'use client';

// This will override global types and provide type definitions for
// the Tangle Restaking Parachain's pallets and extrinsics.
import '@webb-tools/tangle-restaking-types';

import { BN } from '@polkadot/util';
import { TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';
import { useCallback, useMemo } from 'react';

import { LiquidStakingToken } from '../../constants/liquidStaking';
import useApiRx from '../../hooks/useApiRx';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import isLiquidStakingToken from '../../utils/liquidStaking/isLiquidStakingToken';

const useParachainBalances = () => {
  const activeSubstrateAddress = useSubstrateAddress();

  const { result: rawBalances } = useApiRx(
    useCallback(
      (api) => {
        if (activeSubstrateAddress === null) {
          return null;
        }

        // TODO: For some reason, the `api.query.tokens.accounts` method does not recognize passing in `null` for the token parameter, which is equivalent to passing `None` and should return the balance for all tokens. For now, manually casting the return type.
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

      const entryValue = entry.lst ?? entry.Native;

      // Irrelevant entry, skip.
      if (entryValue === undefined || !isLiquidStakingToken(entryValue)) {
        continue;
      }

      const isLiquid = entry.lst !== undefined;
      const balance = encodedBalance[1].free.toBn();

      if (isLiquid) {
        liquidBalances.set(entryValue, balance);
      } else {
        nativeBalances.set(entryValue, balance);
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
