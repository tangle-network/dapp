import { useCallback, useMemo } from 'react';
import useApiRx from '../../hooks/useApiRx';
import createRestakeAssetId from '../../utils/createRestakeAssetId';
import { RestakeAssetId } from '../../types';
import { BN } from '@polkadot/util';
import { SubstrateAddress } from '@tangle-network/webb-ui-components/types/address';
import { PalletMultiAssetDelegationDelegatorDelegatorBlueprintSelection } from '@polkadot/types/lookup';
import { assertSubstrateAddress } from '@tangle-network/webb-ui-components';

type Delegation = {
  operatorAccountAddress: SubstrateAddress;
  assetId: RestakeAssetId;
  amount: BN;
  blueprintSelection: PalletMultiAssetDelegationDelegatorDelegatorBlueprintSelection;
};

const useRestakeDelegations = () => {
  const { result: delegationMap } = useApiRx(
    useCallback((api) => {
      if (api.query.multiAssetDelegation?.delegators === undefined) {
        return null;
      }

      return api.query.multiAssetDelegation.delegators.entries();
    }, []),
  );

  const delegations = useMemo<Delegation[] | null>(() => {
    if (delegationMap === null) {
      return null;
    }

    return delegationMap.flatMap(([, delegation]) => {
      if (delegation.isNone) {
        return [];
      }

      const info = delegation.unwrap();

      return info.delegations.map(
        (delegation) =>
          ({
            assetId: createRestakeAssetId(delegation.assetId),
            amount: delegation.amount.toBn(),
            operatorAccountAddress: assertSubstrateAddress(
              delegation.operator.toString(),
            ),
            blueprintSelection: delegation.blueprintSelection,
          }) satisfies Delegation,
      );
    });
  }, [delegationMap]);

  return delegations;
};

export default useRestakeDelegations;
