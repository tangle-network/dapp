import { u128 } from '@polkadot/types';
import useApiRx from '@webb-tools/tangle-shared-ui/hooks/useApiRx';
import useSubstrateAddress from '@webb-tools/tangle-shared-ui/hooks/useSubstrateAddress';
import { TangleAssetId } from '@webb-tools/tangle-shared-ui/types';
import { useCallback } from 'react';
import useAgnosticAccountInfo from '../../hooks/useAgnosticAccountInfo';

export default function useAccountRewardInfo(supportedAssets: TangleAssetId[]) {
  const activeSubstrateAddress = useSubstrateAddress();
  const { isEvm } = useAgnosticAccountInfo();

  return useApiRx(
    useCallback(
      (apiRx) => {
        if (activeSubstrateAddress === null || isEvm === null) {
          return null;
        }

        if (apiRx.query.rewards?.userServiceReward === undefined) {
          return null;
        }

        return apiRx.queryMulti<u128[]>(
          supportedAssets.map((asset) => {
            return [
              apiRx.query.rewards.userServiceReward,
              [activeSubstrateAddress, asset],
            ];
          }),
        );
      },
      [activeSubstrateAddress, isEvm, supportedAssets],
    ),
  );
}
