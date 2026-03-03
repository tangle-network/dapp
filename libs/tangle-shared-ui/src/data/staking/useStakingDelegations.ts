import { useCallback, useMemo } from 'react';
import useApiRx from '../../hooks/useApiRx';
import createStakingAssetId from '../../utils/createStakingAssetId';
import { StakingAssetId } from '../../types';
import { BN } from '@polkadot/util';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import { PalletMultiAssetDelegationDelegatorDelegatorBlueprintSelection } from '@polkadot/types/lookup';
import { assertSubstrateAddress } from '@tangle-network/ui-components';

type Delegation = {
  operatorAccountAddress: SubstrateAddress;
  assetId: StakingAssetId;
  amount: BN;
  blueprintSelection: PalletMultiAssetDelegationDelegatorDelegatorBlueprintSelection;
};

const useStakingDelegations = () => {
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
            assetId: createStakingAssetId(delegation.asset),
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

export default useStakingDelegations;
