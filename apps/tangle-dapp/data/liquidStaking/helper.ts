import { Option } from '@polkadot/types';
import { AccountId32, Perbill } from '@polkadot/types/interfaces';
import { SpStakingPagedExposureMetadata } from '@polkadot/types/lookup';
import { BN, BN_ZERO } from '@polkadot/util';

import {
  PalletDappStakingV3ContractStakeAmount,
  PalletDappStakingV3DAppInfo,
} from '../../types/astarDappStaking';
import {
  extractDataFromIdentityInfo,
  getApiPromise,
  IdentityDataType,
} from '../../utils/polkadot';

export const fetchValidators = async (
  rpcEndpoint: string,
): Promise<AccountId32[]> => {
  const api = await getApiPromise(rpcEndpoint);
  const validators = (await api.query.session.validators()).map((val) => val);
  return validators;
};

export const fetchMappedIdentityNames = async (
  rpcEndpoint: string,
): Promise<Map<string, string>> => {
  const api = await getApiPromise(rpcEndpoint);
  const map = new Map<string, string>();

  if (!api.query.identity) {
    return map;
  }

  const identityNames = await api.query.identity.identityOf.entries();

  identityNames.forEach((identity) => {
    if (!identity[1].unwrap()[0]) {
      return;
    }

    const validator = identity[0].args[0];
    const info = identity[1].unwrap()[0].info;
    const displayName =
      extractDataFromIdentityInfo(info, IdentityDataType.NAME) ||
      validator.toString();
    map.set(validator.toString(), displayName);
  });
  return map;
};

export const fetchMappedValidatorsTotalValueStaked = async (
  rpcEndpoint: string,
): Promise<Map<string, BN>> => {
  const api = await getApiPromise(rpcEndpoint);

  if (!api.query.staking) {
    throw new Error('staking pallet is not available in the runtime');
  }

  const activeEra = await api.query.staking.activeEra();
  const activeEraIndex = activeEra.unwrap().index;
  const validators = await fetchValidators(rpcEndpoint);

  const erasStakersOverviewMap = new Map<string, BN>();
  const erasStakersOverviewEntries =
    await api.query.staking.erasStakersOverview.entries();

  erasStakersOverviewEntries.forEach((overview) => {
    const [key, exposure] = overview;
    const eraIndex = key.args[0].toNumber();
    const validator = key.args[1].toString();

    const validatorExposure =
      exposure as Option<SpStakingPagedExposureMetadata>;

    if (eraIndex === activeEraIndex.toNumber()) {
      const totalStaked =
        validatorExposure.unwrap().total.unwrap().toBn() || BN_ZERO;
      erasStakersOverviewMap.set(validator, totalStaked);
    }
  });

  const map = new Map<string, BN>();

  validators.forEach((validator) => {
    const totalStaked = erasStakersOverviewMap.get(validator.toString());
    map.set(validator.toString(), totalStaked || BN_ZERO);
  });
  return map;
};

export const fetchMappedValidatorsCommission = async (
  rpcEndpoint: string,
): Promise<Map<string, BN>> => {
  const api = await getApiPromise(rpcEndpoint);
  const validators = await fetchValidators(rpcEndpoint);

  if (!api.query.staking) {
    throw new Error('staking pallet is not available in the runtime');
  }

  const commissionMap = new Map<string, Perbill>();
  const allValidators = await api.query.staking.validators.entries();

  allValidators.forEach(([key, prefs]) => {
    const val = key.args[0].toString();
    const commission = prefs.commission.unwrap();

    commissionMap.set(val, commission);
  });

  const map = new Map<string, BN>();

  validators.forEach((validator) => {
    const commission = commissionMap.get(validator.toString());

    map.set(validator.toString(), commission || BN_ZERO);
  });

  return map;
};

export const fetchChainDecimals = async (
  rpcEndpoint: string,
): Promise<number> => {
  const api = await getApiPromise(rpcEndpoint);
  const chainDecimals = await api.registry.chainDecimals;
  return chainDecimals.length > 0 ? chainDecimals[0] : 18;
};

export const fetchTokenSymbol = async (
  rpcEndpoint: string,
): Promise<string> => {
  const api = await getApiPromise(rpcEndpoint);
  const tokenSymbol = api.registry.chainTokens[0];
  return tokenSymbol;
};

type Dapp = {
  id: string;
  address: string;
};

export const fetchDapps = async (rpcEndpoint: string): Promise<Dapp[]> => {
  const api = await getApiPromise(rpcEndpoint);

  if (!api.query.dappStaking) {
    throw new Error('dappStaking pallet is not available in the runtime');
  }

  const integratedDapps = await api.query.dappStaking.integratedDApps.entries();

  const dapps = integratedDapps.map((dapp) => {
    const dappAddress = JSON.parse(dapp[0].args[0].toString());
    const dappIdOption = dapp[1] as Option<PalletDappStakingV3DAppInfo>;
    let dappId = '';

    if (dappIdOption.isSome) {
      dappId = dappIdOption.unwrap().id.toString();
    }
    return {
      id: dappId,
      address: dappAddress.evm || dappAddress.wasm,
    };
  });

  return dapps;
};

export const fetchMappedDappsTotalValueStaked = async (
  rpcEndpoint: string,
): Promise<Map<string, BN>> => {
  const api = await getApiPromise(rpcEndpoint);

  if (!api.query.dappStaking) {
    throw new Error('dappStaking pallet is not available in the runtime');
  }

  const contractStakes = await api.query.dappStaking.contractStake.entries();
  const map = new Map<string, BN>();
  contractStakes.forEach((contractStake) => {
    const dappId = contractStake[0].args[0].toString();
    const stakeAmount =
      contractStake[1] as PalletDappStakingV3ContractStakeAmount;
    let totalStaked = BN_ZERO;

    if (!stakeAmount.isEmpty) {
      if (!stakeAmount.stakedFuture.isNone) {
        totalStaked = stakeAmount.stakedFuture
          .unwrap()
          .voting.toBn()
          .add(stakeAmount.stakedFuture.unwrap().buildAndEarn.toBn());
      } else {
        totalStaked = stakeAmount.staked.voting
          .toBn()
          .add(stakeAmount.staked.buildAndEarn.toBn());
      }
    }

    map.set(dappId, totalStaked);
  });

  return map;
};

type VaultOrStakePool = {
  id: string;
  totalValueStaked: BN;
  commission: BN;
  accountId: string;
  type: string;
};

export const fetchVaultsAndStakePools = async (
  rpcEndpoint: string,
): Promise<VaultOrStakePool[]> => {
  const api = await getApiPromise(rpcEndpoint);

  if (!api.query.phalaBasePool) {
    throw new Error('phalaBasePool pallet is not available in the runtime');
  }

  const poolsInPhalaBasePool = await api.query.phalaBasePool.pools.entries();

  return poolsInPhalaBasePool.map((pool) => {
    const id = pool[0].args[0].toString();
    const poolInfo = pool[1] as Option<any>;

    let type = '';
    let accountId = '';
    let totalValueStaked = BN_ZERO;
    let commission = BN_ZERO;

    if (poolInfo.isSome) {
      const poolInfoObj = JSON.parse(poolInfo.unwrap().toString());

      if (poolInfoObj.vault) {
        type = 'vault';
        commission = poolInfoObj[type].commission || BN_ZERO;
      } else {
        type = 'stakePool';
        commission = poolInfoObj[type].payoutCommission || BN_ZERO;
      }

      accountId = poolInfoObj[type].basepool.poolAccountId.toString();

      if (poolInfoObj[type].basepool.totalValue !== undefined) {
        totalValueStaked = new BN(
          cleanHexString(poolInfoObj[type].basepool.totalValue.toString()),
          16,
        );
      }
    }

    return {
      id,
      totalValueStaked,
      commission,
      accountId,
      type,
    };
  });
};

export const fetchCollators = async (
  rpcEndpoint: string,
): Promise<string[]> => {
  const api = await getApiPromise(rpcEndpoint);

  if (!api.query.parachainStaking) {
    throw new Error('parachainStaking pallet is not available in the runtime');
  }

  const selectedCollators =
    await api.query.parachainStaking.selectedCandidates();

  const collators = selectedCollators.map((collator) => collator.toString());

  return collators;
};

type CollatorInfo = {
  totalStaked: BN;
  delegationCount: number;
};

export const fetchMappedCollatorInfo = async (
  rpcEndpoint: string,
): Promise<Map<string, CollatorInfo>> => {
  const api = await getApiPromise(rpcEndpoint);

  if (!api.query.parachainStaking) {
    throw new Error('parachainStaking pallet is not available in the runtime');
  }

  const collatorInfos =
    await api.query.parachainStaking.candidateInfo.entries();

  const map = new Map<string, CollatorInfo>();

  collatorInfos.forEach((collatorInfo) => {
    const collator = collatorInfo[0].args[0].toString();
    const info = collatorInfo[1];

    let totalStaked = BN_ZERO;
    let delegationCount = 0;

    if (info.isSome) {
      const infoObj = info.unwrap();
      totalStaked = infoObj.totalCounted.toBn() || BN_ZERO;
      delegationCount = infoObj.delegationCount.toNumber();
    }

    map.set(collator, {
      totalStaked,
      delegationCount,
    });
  });

  return map;
};

/** @internal */
const cleanHexString = (hex: string) => {
  if (!hex) return '';

  if (hex.startsWith('0x')) {
    hex = hex.slice(2);
  }

  return hex;
};
