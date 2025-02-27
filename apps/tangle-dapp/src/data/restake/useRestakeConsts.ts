import type { AugmentedConsts } from '@polkadot/api/types';
import type { MapKnownKeys } from '@tangle-network/dapp-types/utils/types';
import { useCallback, useState } from 'react';
import useApi from '../../hooks/useApi';
import getModuleConstant from '../../utils/getModuleConstant';

export type RestakeConsts = {
  delegationBondLessDelay: number | null;
  leaveDelegatorsDelay: number | null;
  leaveOperatorsDelay: number | null;
  minDelegateAmount: bigint | null;
  minOperatorBondAmount: bigint | null;
  operatorBondLessDelay: number | null;
};

type RestakeConstsKeys = keyof MapKnownKeys<
  AugmentedConsts<'promise'>['multiAssetDelegation']
>;

const CONSTANTS_U32 = [
  'delegationBondLessDelay',
  'leaveDelegatorsDelay',
  'leaveOperatorsDelay',
  'operatorBondLessDelay',
] as const satisfies RestakeConstsKeys[];

const CONSTANTS_U128 = [
  'minDelegateAmount',
  'minOperatorBondAmount',
] as const satisfies RestakeConstsKeys[];

type ConstantU32Name = (typeof CONSTANTS_U32)[number];
type ConstantU128Name = (typeof CONSTANTS_U128)[number];
type ConstantName = ConstantU32Name | ConstantU128Name;

const useRestakeConsts = (): RestakeConsts => {
  // Create initial state with all values set to null
  const [defaultConsts] = useState<RestakeConsts>(() => {
    const initialState = {} as RestakeConsts;

    // Initialize all U32 constants to null
    CONSTANTS_U32.forEach((key) => {
      initialState[key] = null;
    });

    // Initialize all U128 constants to null
    CONSTANTS_U128.forEach((key) => {
      initialState[key] = null;
    });

    return initialState;
  });

  const { result: consts } = useApi(
    useCallback((api) => {
      const getConstant = (name: ConstantName) =>
        getModuleConstant(api, 'multiAssetDelegation', name);

      const result = {} as RestakeConsts;

      // Process U32 constants
      CONSTANTS_U32.forEach((key) => {
        const value = getConstant(key);
        result[key] = value ? value.toNumber() : null;
      });

      // Process U128 constants
      CONSTANTS_U128.forEach((key) => {
        const value = getConstant(key);
        result[key] = value ? value.toBigInt() : null;
      });

      return result;
    }, []),
  );

  return consts ?? defaultConsts;
};

export default useRestakeConsts;
