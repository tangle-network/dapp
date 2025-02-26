import type { AugmentedConsts } from '@polkadot/api/types';
import type { MapKnownKeys } from '@tangle-network/dapp-types/utils/types';
import { useCallback, useState } from 'react';
import useApi from '../../hooks/useApi';
import getModuleConstant from '../../utils/getModuleConstant';

export type RestakeConsts = {
  delegationBondLessDelay: number | null;
  leaveDelegatorsDelay: number | null;
  leaveOperatorsDelay: number | null;
  minDelegateAmount: number | null;
  minOperatorBondAmount: number | null;
  operatorBondLessDelay: number | null;
};

type RestakeConstsKeys = keyof MapKnownKeys<
  AugmentedConsts<'promise'>['multiAssetDelegation']
>;

const CONSTANTS = [
  'delegationBondLessDelay',
  'leaveDelegatorsDelay',
  'leaveOperatorsDelay',
  'minDelegateAmount',
  'minOperatorBondAmount',
  'operatorBondLessDelay',
] as const satisfies RestakeConstsKeys[];

type ConstantName = (typeof CONSTANTS)[number];

const useRestakeConsts = (): RestakeConsts => {
  const [defaultConsts] = useState<RestakeConsts>(
    () =>
      Object.fromEntries(CONSTANTS.map((key) => [key, null])) as RestakeConsts,
  );

  const { result: consts } = useApi(
    useCallback((api) => {
      const getConstant = (name: ConstantName) =>
        getModuleConstant(api, 'multiAssetDelegation', name)?.toNumber() ??
        null;

      return Object.fromEntries(
        CONSTANTS.map((key) => [key, getConstant(key)]),
      ) as RestakeConsts;
    }, []),
  );

  return consts ?? defaultConsts;
};

export default useRestakeConsts;
