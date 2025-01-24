import { u128 } from '@polkadot/types';
import useApiRx from '@webb-tools/tangle-shared-ui/hooks/useApiRx';
import useSubstrateAddress from '@webb-tools/tangle-shared-ui/hooks/useSubstrateAddress';
import { RestakeAssetId } from '@webb-tools/tangle-shared-ui/types';
import { useCallback } from 'react';
import { map } from 'rxjs';
import useAgnosticAccountInfo from '../../hooks/useAgnosticAccountInfo';
import { assertEvmAddress } from '@webb-tools/webb-ui-components/utils/assertEvmAddress';

export default function useAccountRewardInfo() {
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

        return apiRx.query.rewards.userServiceReward.entries<u128>().pipe(
          map((entries) =>
            entries.reduce(
              (acc, [storageKey, value]) => {
                const [accountId, assetId] = storageKey.args;
                if (accountId.eq(activeSubstrateAddress)) {
                  const id = ((): RestakeAssetId | null => {
                    if (assetId.isErc20) {
                      return assertEvmAddress(assetId.asErc20.toHex());
                    }

                    if (assetId.isCustom) {
                      return `${assetId.asCustom.toBigInt()}`;
                    }

                    return null;
                  })();

                  if (id !== null) {
                    acc[id] = value.toBigInt();
                  }
                }

                return acc;
              },
              {} as Record<RestakeAssetId, bigint>,
            ),
          ),
        );
      },
      [activeSubstrateAddress, isEvm],
    ),
  );
}
