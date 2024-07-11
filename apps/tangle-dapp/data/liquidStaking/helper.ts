import { AccountId32 } from '@polkadot/types/interfaces';
import { BN, BN_ZERO } from '@polkadot/util';

import { getApiPromise } from '../../utils/polkadot';
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
  const identityNames = await api.query.identity.identityOf.entries();

  const map = new Map<string, string>();

  identityNames.forEach((identity) => {
    if (!identity[1].unwrap()[0]) {
      return;
    }

    const validator = identity[0].args[0];
    const info = identity[1].unwrap()[0].info;
    let displayName = validator.toString();
    if (info) {
      const displayData = info['display'];
      if (displayData.isNone) return null;
      const displayDataObject: { raw?: string } = JSON.parse(
        displayData.toString(),
      );
      if (displayDataObject.raw !== undefined) {
        const hexString = displayDataObject.raw;
        displayName = Buffer.from(hexString.slice(2), 'hex').toString('utf8');
      }
    }
    map.set(validator.toString(), displayName);
  });
  return map;
};

export const fetchMappedTotalValueStaked = async (
  rpcEndpoint: string,
): Promise<Map<string, BN>> => {
  const api = await getApiPromise(rpcEndpoint);

  if (!api.query.staking) {
    throw new Error('staking pallet is not available in the runtime');
  }

  const activeEra = await api.query.staking.activeEra();
  const activeEraIndex = activeEra.unwrap().index;
  const validators = await fetchValidators(rpcEndpoint);
  const stakerPromises = validators.map(async (val) => {
    const erasStakers = await api.query.staking.erasStakersOverview(
      activeEraIndex,
      val,
    );
    const exposure = erasStakers.unwrap();
    const totalStaked = exposure.total.unwrap().toBn() || BN_ZERO;
    return {
      validator: val.toString(),
      totalStaked,
    };
  });
  const stakers = await Promise.all(stakerPromises);
  const map = new Map<string, BN>();
  stakers.forEach((staker) => {
    map.set(staker.validator, staker.totalStaked);
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

export const fetchMappedCommission = async (
  rpcEndpoint: string,
): Promise<Map<string, BN>> => {
  const api = await getApiPromise(rpcEndpoint);
  const validators = await fetchValidators(rpcEndpoint);
  const commissionPromises = validators.map(async (val) => {
    const prefs = await api.query.staking.validators(val);
    return {
      validator: val.toString(),
      commission: prefs.commission.unwrap(),
    };
  });
  const commissions = await Promise.all(commissionPromises);
  const map = new Map<string, BN>();
  commissions.forEach((commission) => {
    map.set(commission.validator, commission.commission);
  });
  return map;
};
