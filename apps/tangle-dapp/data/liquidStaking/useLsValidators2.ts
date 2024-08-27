import { useCallback, useEffect, useState } from 'react';

import {
  LsProtocolId,
  LsProtocolType,
} from '../../constants/liquidStaking/types';
import useLocalStorage, { LocalStorageKey } from '../../hooks/useLocalStorage';
import {
  Collator,
  Dapp,
  LiquidStakingItem,
  PhalaVaultOrStakePool,
  Validator,
} from '../../types/liquidStaking';
import getLsProtocolDef from '../../utils/liquidStaking/getLsProtocolDef';

const useLsValidators2 = (protocolId: LsProtocolId) => {
  const { setWithPreviousValue: setLiquidStakingTableData } = useLocalStorage(
    LocalStorageKey.LIQUID_STAKING_TABLE_DATA,
  );

  const [isLoading, setIsLoading] = useState(false);

  const [items, setItems] = useState<
    Validator[] | PhalaVaultOrStakePool[] | Dapp[] | Collator[]
  >([]);

  const dataType = getDataType(protocolId);

  const fetchData = useCallback(
    async (protocolId: LsProtocolId) => {
      const protocol = getLsProtocolDef(protocolId);

      if (protocol.type !== LsProtocolType.TANGLE_RESTAKING_PARACHAIN) {
        setItems([]);
        setIsLoading(false);

        return;
      }

      const newItems = protocol.adapter.fetchNetworkEntities(
        protocol.rpcEndpoint,
      );

      setItems(newItems);

      setLiquidStakingTableData((prev) => ({
        ...prev?.value,
        [protocolId]: newItems,
      }));

      setIsLoading(false);
    },
    [setLiquidStakingTableData],
  );

  // Whenever the selected protocol changes, fetch the data for
  // the new protocol.
  useEffect(() => {
    setItems([]);
    setIsLoading(true);
    fetchData(protocolId);
  }, [protocolId, fetchData]);

  return {
    isLoading,
    data: items,
    dataType,
  };
};

const getDataType = (chain: LsProtocolId): LiquidStakingItem | null => {
  switch (chain) {
    case LsProtocolId.MANTA:
      return LiquidStakingItem.COLLATOR;
    case LsProtocolId.MOONBEAM:
      return LiquidStakingItem.COLLATOR;
    case LsProtocolId.TANGLE_RESTAKING_PARACHAIN:
    case LsProtocolId.POLKADOT:
      return LiquidStakingItem.VALIDATOR;
    case LsProtocolId.PHALA:
      return LiquidStakingItem.VAULT_OR_STAKE_POOL;
    case LsProtocolId.ASTAR:
      return LiquidStakingItem.DAPP;
    case LsProtocolId.CHAINLINK:
    case LsProtocolId.LIVEPEER:
    case LsProtocolId.POLYGON:
    case LsProtocolId.THE_GRAPH:
      return null;
  }
};

export default useLsValidators2;
