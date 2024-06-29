import usePolkadotApi from '../../hooks/usePolkadotApi';
import getModuleConstant from '../../utils/getModuleConstant';

export default function useRestakeConsts() {
  const { apiPromise } = usePolkadotApi();

  const bondDuration =
    getModuleConstant(
      apiPromise,
      'multiAssetDelegation',
      'bondDuration',
    )?.toNumber() ?? null;

  const delegationBondLessDelay =
    getModuleConstant(
      apiPromise,
      'multiAssetDelegation',
      'delegationBondLessDelay',
    )?.toNumber() ?? null;

  const leaveDelegatorsDelay =
    getModuleConstant(
      apiPromise,
      'multiAssetDelegation',
      'leaveDelegatorsDelay',
    )?.toNumber() ?? null;

  const leaveOperatorsDelay =
    getModuleConstant(
      apiPromise,
      'multiAssetDelegation',
      'leaveOperatorsDelay',
    )?.toNumber() ?? null;

  const minDelegateAmount =
    getModuleConstant(
      apiPromise,
      'multiAssetDelegation',
      'minDelegateAmount',
    )?.toBigInt() ?? null;

  const minOperatorBondAmount =
    getModuleConstant(
      apiPromise,
      'multiAssetDelegation',
      'minOperatorBondAmount',
    )?.toBigInt() ?? null;

  const operatorBondLessDelay =
    getModuleConstant(
      apiPromise,
      'multiAssetDelegation',
      'operatorBondLessDelay',
    )?.toNumber() ?? null;

  return {
    bondDuration,
    delegationBondLessDelay,
    leaveDelegatorsDelay,
    leaveOperatorsDelay,
    minDelegateAmount,
    minOperatorBondAmount,
    operatorBondLessDelay,
  };
}
