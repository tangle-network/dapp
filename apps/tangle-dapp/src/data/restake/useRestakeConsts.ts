import { useProtocolConfig } from '@tangle-network/tangle-shared-ui/data/graphql';
import { useMemo } from 'react';

export type RestakeConsts = {
  delegationBondLessDelay: number | null;
  leaveDelegatorsDelay: number | null;
  leaveOperatorsDelay: number | null;
  minDelegateAmount: bigint | null;
  minOperatorBondAmount: bigint | null;
  operatorBondLessDelay: number | null;
};

const useRestakeConsts = (): RestakeConsts => {
  const { data: config } = useProtocolConfig();

  return useMemo(() => {
    if (!config) {
      return {
        delegationBondLessDelay: null,
        leaveDelegatorsDelay: null,
        leaveOperatorsDelay: null,
        minDelegateAmount: null,
        minOperatorBondAmount: null,
        operatorBondLessDelay: null,
      };
    }

    return {
      delegationBondLessDelay: Number(config.delegationBondLessDelay),
      leaveDelegatorsDelay: Number(config.leaveDelegatorsDelay),
      leaveOperatorsDelay: Number(config.leaveOperatorsDelay),
      // TODO: Fetch these from contract when available
      minDelegateAmount: null,
      minOperatorBondAmount: null,
      operatorBondLessDelay: null,
    };
  }, [config]);
};

export default useRestakeConsts;
