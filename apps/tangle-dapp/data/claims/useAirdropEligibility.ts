import { Option, u128 } from '@polkadot/types';
import { PalletAirdropClaimsStatementKind } from '@polkadot/types/lookup';
import { isEthereumAddress } from '@polkadot/util-crypto';
import {
  useCallback,
  useDebugValue,
  useEffect,
  useMemo,
  useState,
} from 'react';

import useActiveAccountAddress from '../../hooks/useActiveAccountAddress';
import useLocalStorage, { LocalStorageKey } from '../../hooks/useLocalStorage';
import usePolkadotApi from '../../hooks/usePolkadotApi';

const useAirdropEligibility = () => {
  const [isEligible, setIsEligible] = useState<boolean | null>(null);

  useDebugValue(isEligible);

  const { value: eligibilityCache, setWithPreviousValue: setEligibilityCache } =
    useLocalStorage(LocalStorageKey.AirdropEligibilityCache, true);

  const activeAccountAddress = useActiveAccountAddress();

  const { value: claimInfo } = usePolkadotApi(
    useCallback(
      (api) => {
        if (activeAccountAddress === null) {
          return Promise.resolve(null);
        }

        const params = isEthereumAddress(activeAccountAddress)
          ? { EVM: activeAccountAddress }
          : { Native: activeAccountAddress };

        return api.queryMulti<
          [Option<u128>, Option<PalletAirdropClaimsStatementKind>]
        >([
          // Claim amount.
          [api.query.claims.claims, params],
          // Claim statement.
          [api.query.claims.signing, params],
        ]);
      },
      [activeAccountAddress]
    )
  );

  const claimAmountOpt = claimInfo?.[0] || null;
  const claimStatementOpt = claimInfo?.[1] || null;

  const isAirdropEligibleByCache = useMemo(() => {
    if (activeAccountAddress === null) {
      return null;
    }

    return eligibilityCache !== null
      ? eligibilityCache[activeAccountAddress] ?? null
      : null;
  }, [activeAccountAddress, eligibilityCache]);

  useDebugValue(isAirdropEligibleByCache);

  // Update the eligibility when the claim amount and statement
  // are known/fetched.
  useEffect(() => {
    if (
      // Need to know these values to determine eligibility.
      activeAccountAddress === null ||
      claimAmountOpt === null ||
      claimStatementOpt === null ||
      // If it is already known whether the active account is eligible
      // for the airdrop, then do nothing.
      isEligible !== null ||
      isAirdropEligibleByCache !== null
    ) {
      return;
    }

    const isNowEligible =
      claimAmountOpt.isSome &&
      claimStatementOpt.isSome &&
      claimAmountOpt.unwrap().gtn(0) &&
      claimStatementOpt.unwrap().isRegular;

    setIsEligible(isNowEligible);

    // Update the eligibility cache in local storage.
    setEligibilityCache((previous) => ({
      ...previous,
      [activeAccountAddress]: isNowEligible,
    }));
  }, [
    activeAccountAddress,
    claimAmountOpt,
    claimStatementOpt,
    isAirdropEligibleByCache,
    isEligible,
    setEligibilityCache,
  ]);

  return {
    isAirdropEligible:
      isAirdropEligibleByCache !== null ? isAirdropEligibleByCache : isEligible,
    claimAmount: claimAmountOpt,
    claimStatement: claimStatementOpt,
  };
};

export default useAirdropEligibility;
