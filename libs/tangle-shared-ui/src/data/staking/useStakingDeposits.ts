import assertSubstrateAddress from '@tangle-network/ui-components/utils/assertSubstrateAddress';
import { useCallback } from 'react';
import { map } from 'rxjs';
import useApiRx from '../../hooks/useApiRx';
import createStakingAssetId from '../../utils/createStakingAssetId';

const useStakingDeposits = () => {
  return useApiRx(
    useCallback((apiRx) => {
      if (apiRx.query.multiAssetDelegation?.delegators === undefined) {
        return null;
      }

      return apiRx.query.multiAssetDelegation.delegators.entries().pipe(
        map((entries) =>
          entries
            .filter(([, delegatorInfo]) => delegatorInfo.isSome)
            .flatMap(
              ([
                {
                  args: [delegatorId],
                },
                delegatorInfo,
              ]) => {
                const info = delegatorInfo.unwrap();

                return info.deposits
                  .entries()
                  .map(([assetId, deposit]) => {
                    return {
                      delegatorId: assertSubstrateAddress(
                        delegatorId.toString(),
                      ),
                      assetId: createStakingAssetId(assetId),
                      amount: deposit.amount.toBn(),
                      delegatedAmount: deposit.delegatedAmount.toBn(),
                    };
                  })
                  .toArray();
              },
            ),
        ),
      );
    }, []),
  );
};

export default useStakingDeposits;
