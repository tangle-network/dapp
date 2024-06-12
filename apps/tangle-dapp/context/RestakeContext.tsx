'use client';

import { Evaluate } from '@webb-tools/dapp-types/utils/types';
import { createContext, type FC, type PropsWithChildren } from 'react';

import useRestakingAssetMap from '../data/restaking/useRestakingAssetMap';
import useRestakingDelegatorInfo from '../data/restaking/useRestakingDelegatorInfo';
import useRestakingOperatorMap from '../data/restaking/useRestakingOperatorMap';
import type { AssetMap, DelegatorInfo, OperatorMap } from '../types/restake';

interface RestakeContextProps {
  /**
   * A map of operator metadata keyed by the operator's account ID.
   */
  operatorMap: Evaluate<OperatorMap>;

  /**
   * A map of multi-asset delegation assets keyed by the asset's asset ID.
   */
  assetMap: Evaluate<AssetMap>;

  /**
   * The current active delegator info.
   */
  delegatorInfo: Evaluate<DelegatorInfo> | null;
}

export const RestakeContext = createContext<RestakeContextProps>({
  operatorMap: {},
  assetMap: {},
  delegatorInfo: null,
});

const RestakeProvider: FC<PropsWithChildren> = ({ children }) => {
  // Retrieve the list of operators on the system
  const { operatorMap } = useRestakingOperatorMap();

  // Retrieve the list of multi-asset delegation assets
  const { assetMap } = useRestakingAssetMap();

  // Retrieve the current active delegator info
  const { delegatorInfo } = useRestakingDelegatorInfo();

  return (
    <RestakeContext.Provider
      value={{
        operatorMap,
        assetMap,
        delegatorInfo,
      }}
    >
      {children}
    </RestakeContext.Provider>
  );
};

export default RestakeProvider;
