import { BN_ZERO } from '@polkadot/util';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { LS_CHAIN_MAP, LsProtocolId } from '../../constants/liquidStaking';
import useLocalStorage, { LocalStorageKey } from '../../hooks/useLocalStorage';
import {
  Collator,
  Dapp,
  LiquidStakingItem,
  Validator,
  VaultOrStakePool,
} from '../../types/liquidStaking';
import {
  fetchChainDecimals,
  fetchCollators,
  fetchDapps,
  fetchMappedCollatorInfo,
  fetchMappedDappsTotalValueStaked,
  fetchMappedIdentityNames,
  fetchMappedValidatorsCommission,
  fetchMappedValidatorsTotalValueStaked,
  fetchTokenSymbol,
  fetchValidators,
  fetchVaultsAndStakePools,
} from './helper';

const useLiquidStakingItems = (selectedChain: LsProtocolId) => {
  const { setWithPreviousValue: setLiquidStakingTableData } = useLocalStorage(
    LocalStorageKey.LIQUID_STAKING_TABLE_DATA,
  );

  const [isLoading, setIsLoading] = useState(false);

  const [items, setItems] = useState<
    Validator[] | VaultOrStakePool[] | Dapp[] | Collator[]
  >([]);

  const dataType = useMemo(() => getDataType(selectedChain), [selectedChain]);

  const fetchData = useCallback(
    async (chain: LsProtocolId) => {
      const endpoint = LS_CHAIN_MAP[chain]?.rpcEndpoint;

      if (!endpoint) {
        setItems([]);
        setIsLoading(false);
        return;
      }

      let fetchedItems: Validator[] | VaultOrStakePool[] | Dapp[] | Collator[] =
        [];

      switch (chain) {
        case LsProtocolId.POLKADOT:
          fetchedItems = await getValidators(endpoint);
          break;

        case LsProtocolId.ASTAR:
          fetchedItems = await getDapps(endpoint);
          break;

        case LsProtocolId.PHALA:
          fetchedItems = await getVaultsAndStakePools(endpoint);
          break;

        case LsProtocolId.MOONBEAM:
          fetchedItems = await getCollators(
            endpoint,
            LsProtocolId.MOONBEAM,
            'https://stakeglmr.com/',
          );
          break;

        case LsProtocolId.MANTA:
          fetchedItems = await getCollators(
            endpoint,
            LsProtocolId.MANTA,
            'https://manta.subscan.io/account/',
          );
          break;

        default:
          fetchedItems = [];
          break;
      }

      setItems(fetchedItems);
      setLiquidStakingTableData((prev) => ({
        ...prev?.value,
        [chain]: fetchedItems,
      }));
      setIsLoading(false);
    },
    [setLiquidStakingTableData],
  );

  // Whenever the selected chain changes, fetch the data for the new chain
  useEffect(() => {
    setItems([]);
    setIsLoading(true);
    fetchData(selectedChain);
  }, [selectedChain, fetchData]);

  return {
    isLoading,
    data: items,
    dataType,
  };
};

export default useLiquidStakingItems;

const getDataType = (chain: LsProtocolId) => {
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
    default:
      return LiquidStakingItem.VALIDATOR;
  }
};

const getValidators = async (endpoint: string): Promise<Validator[]> => {
  const [
    validators,
    mappedIdentityNames,
    mappedTotalValueStaked,
    mappedCommission,
    chainDecimals,
    chainTokenSymbol,
  ] = await Promise.all([
    fetchValidators(endpoint),
    fetchMappedIdentityNames(endpoint),
    fetchMappedValidatorsTotalValueStaked(endpoint),
    fetchMappedValidatorsCommission(endpoint),
    fetchChainDecimals(endpoint),
    fetchTokenSymbol(endpoint),
  ]);

  return validators.map((val) => {
    const identityName = mappedIdentityNames.get(val.toString());
    const totalValueStaked = mappedTotalValueStaked.get(val.toString());
    const commission = mappedCommission.get(val.toString());

    return {
      id: val.toString(),
      validatorAddress: val.toString(),
      validatorIdentity: identityName || val.toString(),
      totalValueStaked: totalValueStaked || BN_ZERO,
      validatorAPY: 0,
      validatorCommission: commission || BN_ZERO,
      chain: LsProtocolId.POLKADOT,
      chainDecimals,
      chainTokenSymbol,
      itemType: LiquidStakingItem.VALIDATOR,
      href: `https://polkadot.subscan.io/account/${val.toString()}`,
    };
  });
};

const getDapps = async (endpoint: string): Promise<Dapp[]> => {
  const [
    dapps,
    mappedTotalValueStaked,
    chainDecimals,
    chainTokenSymbol,
    stakingDappsResponse,
  ] = await Promise.all([
    fetchDapps(endpoint),
    fetchMappedDappsTotalValueStaked(endpoint),
    fetchChainDecimals(endpoint),
    fetchTokenSymbol(endpoint),
    fetch('https://api.astar.network/api/v1/astar/dapps-staking/dapps'),
  ]);

  if (!stakingDappsResponse.ok) {
    throw new Error('Failed to fetch staking dapps');
  }

  const dappInfosArray = await stakingDappsResponse.json();
  const dappInfosMap = new Map(
    dappInfosArray.map((dappInfo: any) => [dappInfo.address, dappInfo]),
  );

  return dapps.map((dapp) => {
    const totalValueStaked = mappedTotalValueStaked.get(dapp.id);
    const dappInfo = dappInfosMap.get(dapp.address) as {
      name?: string;
      contractType?: string;
    };

    return {
      id: dapp.id,
      dappContractAddress: dapp.address,
      dappName: dappInfo ? dappInfo.name || dapp.address : dapp.address,
      dappContractType: dappInfo ? dappInfo.contractType || '' : '',
      commission: BN_ZERO,
      totalValueStaked: totalValueStaked || BN_ZERO,
      chain: LsProtocolId.ASTAR,
      chainDecimals,
      chainTokenSymbol,
      itemType: LiquidStakingItem.DAPP,
      href: `https://portal.astar.network/astar/dapp-staking/dapp?dapp=${dapp.address}`,
    };
  });
};

const getVaultsAndStakePools = async (
  endpoint: string,
): Promise<VaultOrStakePool[]> => {
  const [vaultsAndStakePools, chainDecimals, chainTokenSymbol] =
    await Promise.all([
      fetchVaultsAndStakePools(endpoint),
      fetchChainDecimals(endpoint),
      fetchTokenSymbol(endpoint),
    ]);

  return vaultsAndStakePools.map((val) => {
    const vaultOrStakePoolID = val.id;
    const type = val.type === 'vault' ? 'vault' : 'stake-pool';

    return {
      id: val.id,
      vaultOrStakePoolID: val.id,
      vaultOrStakePoolAccountID: val.accountId,
      vaultOrStakePoolName: val.id,
      commission: val.commission,
      totalValueStaked: val.totalValueStaked,
      chain: LsProtocolId.PHALA,
      chainDecimals,
      chainTokenSymbol,
      type,
      itemType: LiquidStakingItem.VAULT_OR_STAKE_POOL,
      href: `https://app.phala.network/phala/${type}/${vaultOrStakePoolID}`,
    };
  });
};

const getCollators = async (
  endpoint: string,
  chain: LsProtocolId,
  href: string,
): Promise<Collator[]> => {
  const [
    collators,
    mappedIdentityNames,
    mappedCollatorInfo,
    chainDecimals,
    chainTokenSymbol,
  ] = await Promise.all([
    fetchCollators(endpoint),
    fetchMappedIdentityNames(endpoint),
    fetchMappedCollatorInfo(endpoint),
    fetchChainDecimals(endpoint),
    fetchTokenSymbol(endpoint),
  ]);

  return collators.map((collator) => {
    const identityName = mappedIdentityNames.get(collator);
    const collatorInfo = mappedCollatorInfo.get(collator);

    let collatorExternalLink = '';

    if (chain === LsProtocolId.MOONBEAM) {
      collatorExternalLink = href;
    } else if (chain === LsProtocolId.MANTA) {
      collatorExternalLink = href + collator;
    }

    return {
      id: collator,
      collatorAddress: collator,
      collatorIdentity: identityName || collator,
      collatorDelegationCount: collatorInfo?.delegationCount || 0,
      totalValueStaked: collatorInfo?.totalStaked || BN_ZERO,
      chain,
      chainDecimals,
      chainTokenSymbol,
      itemType: LiquidStakingItem.COLLATOR,
      href: collatorExternalLink,
    };
  });
};
