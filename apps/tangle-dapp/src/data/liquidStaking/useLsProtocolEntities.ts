import useLocalStorage, {
  LocalStorageKey,
} from '@webb-tools/tangle-shared-ui/hooks/useLocalStorage';
import { LsProtocolId } from '@webb-tools/tangle-shared-ui/types/liquidStaking';
import { LiquidStakingItem } from '@webb-tools/tangle-shared-ui/types/liquidStaking';
import { useCallback, useEffect, useState } from 'react';

import { LsNetworkId } from '../../constants/liquidStaking/types';
import getLsProtocolDef from '../../utils/liquidStaking/getLsProtocolDef';
import { ProtocolEntity } from './adapter';

const useLsProtocolEntities = (protocolId: LsProtocolId) => {
  const { setWithPreviousValue: setLiquidStakingTableData } = useLocalStorage(
    LocalStorageKey.LIQUID_STAKING_TABLE_DATA,
  );

  const [isLoading, setIsLoading] = useState(false);
  const [entities, setEntities] = useState<ProtocolEntity[]>([]);

  const dataType = getDataType(protocolId);

  const fetchData = useCallback(
    async (protocolId: LsProtocolId) => {
      const protocol = getLsProtocolDef(protocolId);

      if (protocol.networkId !== LsNetworkId.TANGLE_RESTAKING_PARACHAIN) {
        setEntities([]);
        setIsLoading(false);

        return;
      }

      const newEntities = await protocol.adapter.fetchProtocolEntities(
        protocol.rpcEndpoint,
      );

      setEntities(newEntities);

      setLiquidStakingTableData((prev) => ({
        ...prev?.value,
        [protocolId]: newEntities,
      }));

      setIsLoading(false);
    },
    [setLiquidStakingTableData],
  );

  // Whenever the selected protocol changes, fetch the data for
  // the new protocol.
  useEffect(() => {
    setEntities([]);
    setIsLoading(true);
    fetchData(protocolId);
  }, [protocolId, fetchData]);

  return {
    isLoading,
    data: entities,
    dataType,
  };
};

const getDataType = (chain: LsProtocolId): LiquidStakingItem | null => {
  switch (chain) {
    case LsProtocolId.MANTA:
      return LiquidStakingItem.COLLATOR;
    case LsProtocolId.MOONBEAM:
      return LiquidStakingItem.COLLATOR;
    case LsProtocolId.POLKADOT:
      return LiquidStakingItem.VALIDATOR;
    case LsProtocolId.PHALA:
      return LiquidStakingItem.VAULT_OR_STAKE_POOL;
    case LsProtocolId.ASTAR:
      return LiquidStakingItem.DAPP;
    case LsProtocolId.TANGLE_MAINNET:
    case LsProtocolId.TANGLE_TESTNET:
    case LsProtocolId.TANGLE_LOCAL:
      return null;
  }
};

export default useLsProtocolEntities;