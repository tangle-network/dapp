import { useMemo } from 'react';

import usePolkadotApi from '../../hooks/usePolkadotApi';
import getModuleConstant from '../../utils/getModuleConstant';

export default function useRestakeConsts() {
  const { apiPromise } = usePolkadotApi();

  const bondDuration = useMemo(
    () =>
      getModuleConstant(
        apiPromise,
        'multiAssetDelegation',
        'bondDuration',
      )?.toNumber() ?? null,
    [apiPromise],
  );

  const delegationBondLessDelay = useMemo(
    () =>
      getModuleConstant(
        apiPromise,
        'multiAssetDelegation',
        'delegationBondLessDelay',
      )?.toNumber() ?? null,
    [apiPromise],
  );

  const leaveDelegatorsDelay = useMemo(
    () =>
      getModuleConstant(
        apiPromise,
        'multiAssetDelegation',
        'leaveDelegatorsDelay',
      )?.toNumber() ?? null,
    [apiPromise],
  );

  const leaveOperatorsDelay = useMemo(
    () =>
      getModuleConstant(
        apiPromise,
        'multiAssetDelegation',
        'leaveOperatorsDelay',
      )?.toNumber() ?? null,
    [apiPromise],
  );

  const minDelegateAmount = useMemo(
    () =>
      getModuleConstant(
        apiPromise,
        'multiAssetDelegation',
        'minDelegateAmount',
      )?.toBigInt() ?? null,
    [apiPromise],
  );

  const minOperatorBondAmount = useMemo(
    () =>
      getModuleConstant(
        apiPromise,
        'multiAssetDelegation',
        'minOperatorBondAmount',
      )?.toBigInt() ?? null,
    [apiPromise],
  );

  const operatorBondLessDelay = useMemo(
    () =>
      getModuleConstant(
        apiPromise,
        'multiAssetDelegation',
        'operatorBondLessDelay',
      )?.toNumber() ?? null,
    [apiPromise],
  );

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
