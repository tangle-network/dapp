'use client';

import { Option } from '@polkadot/types';
import { PalletRolesRestakingLedger } from '@polkadot/types/lookup';
import { createContext, FC, PropsWithChildren } from 'react';

import useRestakingEarnings, {
  EarningRecord,
} from '../data/restaking/useRestakingEarnings';
import useRestakingRoleLedger from '../data/restaking/useRestakingRoleLedger';
import useSubstrateAddress from '../hooks/useSubstrateAddress';

export const RestakeContext = createContext({
  ledger: null as Option<PalletRolesRestakingLedger> | null,
  earningsRecord: null as EarningRecord | null,
  isLoading: true,
});

const RestakeProvider: FC<PropsWithChildren> = ({ children }) => {
  const substrateAddress = useSubstrateAddress();
  const { data: ledger, isLoading: isLedgerLoading } =
    useRestakingRoleLedger(substrateAddress);
  const { data: earningsRecord, isLoading: isEarningsLoading } =
    useRestakingEarnings(substrateAddress);

  return (
    <RestakeContext.Provider
      value={{
        ledger,
        earningsRecord,
        isLoading: isLedgerLoading || isEarningsLoading,
      }}
    >
      {children}
    </RestakeContext.Provider>
  );
};

export default RestakeProvider;
