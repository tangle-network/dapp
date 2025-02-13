import assertSubstrateAddress from '@tangle-network/webb-ui-components/utils/assertSubstrateAddress';
import { useCallback } from 'react';
import { map } from 'rxjs';
import useApiRx from '../../hooks/useApiRx';
import createRestakeAssetId from '../../utils/createRestakeAssetId';

const useRestakeDeposits = () => {
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
                      assetId: createRestakeAssetId(assetId),
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

export default useRestakeDeposits;
