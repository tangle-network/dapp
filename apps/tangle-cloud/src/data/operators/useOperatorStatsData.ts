import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
// import useRestakeOperatorMap from '@tangle-network/tangle-shared-ui/data/restake/useRestakeOperatorMap';
// import useRestakeDelegatorInfo from '@tangle-network/tangle-shared-ui/data/restake/useRestakeDelegatorInfo';
// import useRestakeTvl from '@tangle-network/tangle-shared-ui/data/restake/useRestakeTvl';
// import getTVLToDisplay from '@tangle-network/tangle-shared-ui/utils/getTVLToDisplay';

// TODO: Implement this
export const useOperatorStatsData = (
  operatorAddress: SubstrateAddress | null | undefined,
) => {
  if (!operatorAddress) {
    return null;
  }

  // const { result: operatorMap } = useRestakeOperatorMap();
  // const { result: delegatorInfo } = useRestakeDelegatorInfo();
  // const { operatorTvl } = useRestakeTvl(delegatorInfo);

  // const operatorData = useMemo(() => {
  //   if (!accountAddress || !isOperator || !isSubstrateAddress(accountAddress)) {
  //     return null;
  //   }

  //   return operatorMap.get(accountAddress);
  // }, [accountAddress, operatorMap, isOperator]);

  // const totalRestaked = useMemo(() => {
  //   if (
  //     !accountAddress ||
  //     !operatorData ||
  //     !isSubstrateAddress(accountAddress)
  //   ) {
  //     return EMPTY_VALUE_PLACEHOLDER;
  //   }

  //   return getTVLToDisplay(operatorTvl.get(accountAddress));
  // }, [accountAddress, operatorTvl, operatorData]);

  // const restakersCount = useMemo(
  //   () =>
  //     operatorData?.restakersCount.toLocaleString() ?? EMPTY_VALUE_PLACEHOLDER,
  //   [operatorData?.restakersCount],
  // );

  return {
    registeredBlueprints: 0,
    totalServices: 0,
    avgUptime: 0,
    deployedServices: 0,
    publishedServices: 0,
    pendingServices: 0,
  };
};
