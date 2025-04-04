import { Option, u128 } from '@polkadot/types';
import { PalletAirdropClaimsStatementKind } from '@polkadot/types/lookup';
import { isEthereumAddress } from '@polkadot/util-crypto';
import useApiRx from '@tangle-network/tangle-shared-ui/hooks/useApiRx';
import { useCallback, useEffect, useState } from 'react';

import useActiveAccountAddress from '@tangle-network/tangle-shared-ui/hooks/useActiveAccountAddress';

const useAirdropEligibility = () => {
  const [isEligible, setIsEligible] = useState<boolean | null>(null);
  const activeAccountAddress = useActiveAccountAddress();

  const { result: claimInfo } = useApiRx(
    useCallback(
      (api) => {
        if (activeAccountAddress === null) {
          return null;
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
      [activeAccountAddress],
    ),
  );

  const claimAmountOpt = claimInfo?.[0] || null;
  const claimStatementOpt = claimInfo?.[1] || null;

  // Update the eligibility when the claim amount and statement
  // are known/fetched.
  useEffect(() => {
    // Cannot determine eligibility without any active account.
    if (activeAccountAddress === null) {
      return;
    }

    const isNowEligible =
      claimAmountOpt !== null &&
      claimAmountOpt.isSome &&
      claimStatementOpt !== null &&
      claimStatementOpt.isSome &&
      claimAmountOpt.unwrap().gtn(0) &&
      claimStatementOpt.unwrap().isRegular;

    setIsEligible(isNowEligible);
  }, [activeAccountAddress, claimAmountOpt, claimStatementOpt]);

  return {
    isEligible,
    claimAmount: claimAmountOpt,
    claimStatement: claimStatementOpt,
  };
};

export default useAirdropEligibility;
