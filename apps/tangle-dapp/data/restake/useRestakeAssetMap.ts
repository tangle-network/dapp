import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import usePolkadotApi from '@webb-tools/tangle-shared-ui/hooks/usePolkadotApi';
import { assetDetailsRxQuery } from '@webb-tools/tangle-shared-ui/queries/restake/assetDetails';
import { useObservableState } from 'observable-hooks';

import useRestakeAssetIds from './useRestakeAssetIds';

/**
 * Hook to retrieve the asset map for restaking.
 * @returns
 *  - `assetMap`: The asset map.
 *  - `assetMap$`: The observable for the asset map.
 */
export default function useRestakeAssetMap() {
  const { apiRx } = usePolkadotApi();
  const { activeChain } = useWebContext();

  const { assetIds } = useRestakeAssetIds();

  const assetMap$ = assetDetailsRxQuery(
    apiRx,
    assetIds,
    activeChain?.nativeCurrency,
  );

  const assetMap = useObservableState(assetMap$, {});

  return {
    assetMap,
    assetMap$,
  };
}
