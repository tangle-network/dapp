import { BN_ZERO } from '@polkadot/util';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  LiquidStakingChainId,
  LS_NETWORK_CONFIG,
} from '../../constants/liquidStaking';
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

const useLiquidStakingItems = (selectedChain: LiquidStakingChainId) => {
  const {
    // valueOpt: liquidStakingTableData,
    setWithPreviousValue: setLiquidStakingTableData,
  } = useLocalStorage(LocalStorageKey.LIQUID_STAKING_TABLE_DATA, true);
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<
    Validator[] | VaultOrStakePool[] | Dapp[] | Collator[]
  >([]);
  const dataType = useMemo(() => getDataType(selectedChain), [selectedChain]);

  // const cachedData = useMemo(
  //   () => liquidStakingTableData.value[selectedChain] || [],
  //   [liquidStakingTableData, selectedChain],
  // );
  // console.debug('cachedData', cachedData);

  const fetchData = useCallback(
    async (chain: LiquidStakingChainId) => {
      const endpoint = LS_NETWORK_CONFIG[chain]?.endpoint;

      if (!endpoint) {
        setItems([]);
        setIsLoading(false);
        return;
      }

      let fetchedItems: Validator[] | VaultOrStakePool[] | Dapp[] | Collator[] =
        [];

      switch (chain) {
        case LiquidStakingChainId.POLKADOT:
          fetchedItems = await getValidators(endpoint);
          break;

        case LiquidStakingChainId.ASTAR:
          fetchedItems = await getDapps(endpoint);
          break;

        case LiquidStakingChainId.PHALA:
          fetchedItems = await getVaultsAndStakePools(endpoint);
          break;

        case LiquidStakingChainId.MOONBEAM:
          fetchedItems = await getCollators(
            endpoint,
            LiquidStakingChainId.MOONBEAM,
            'https://stakeglmr.com/',
          );
          break;

        case LiquidStakingChainId.MANTA:
          fetchedItems = await getCollators(
            endpoint,
            LiquidStakingChainId.MANTA,
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

const getDataType = (chain: LiquidStakingChainId) => {
  switch (chain) {
    case LiquidStakingChainId.MANTA:
      return LiquidStakingItem.COLLATOR;
    case LiquidStakingChainId.MOONBEAM:
      return LiquidStakingItem.COLLATOR;
    case LiquidStakingChainId.TANGLE_RESTAKING_PARACHAIN:
    case LiquidStakingChainId.POLKADOT:
      return LiquidStakingItem.VALIDATOR;
    case LiquidStakingChainId.PHALA:
      return LiquidStakingItem.VAULT_OR_STAKE_POOL;
    case LiquidStakingChainId.ASTAR:
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
      chain: LiquidStakingChainId.POLKADOT,
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
      chain: LiquidStakingChainId.ASTAR,
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
      chain: LiquidStakingChainId.PHALA,
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
  chain: LiquidStakingChainId,
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

    if (chain === LiquidStakingChainId.MOONBEAM) {
      collatorExternalLink = href;
    } else if (chain === LiquidStakingChainId.MANTA) {
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
