'use client';

import { Option } from '@polkadot/types';
import { PalletRolesRestakingLedger } from '@polkadot/types/lookup';
import { createContext, FC, PropsWithChildren } from 'react';

import type { EarningRecord } from '../data/restaking/types';
import useRestakingEarnings from '../data/restaking/useRestakingEarnings';
import useRestakingRoleLedger from '../data/restaking/useRestakingRoleLedger';
import useSubstrateAddress from '../hooks/useSubstrateAddress';

export type RestakeContextType = {
  ledger: Option<PalletRolesRestakingLedger> | null;
  earningsRecord: EarningRecord | null;
  isLoading: boolean;
};

export const RestakeContext = createContext<RestakeContextType>({
  ledger: null,
  earningsRecord: null,
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
