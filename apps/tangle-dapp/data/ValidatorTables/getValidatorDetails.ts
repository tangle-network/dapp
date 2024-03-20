import { AccountId } from '@polkadot/types/interfaces';

import { Validator } from '../../types';
import {
  formatTokenBalance,
  getPolkadotApiPromise,
  getTotalNumberOfNominators,
  getValidatorCommission,
  getValidatorIdentity,
} from '../../utils/polkadot';

export type ValidatorStatus = 'Active' | 'Waiting';

export async function getValidatorDetails(
  rpcEndpoint: string,
  address: AccountId,
  status: ValidatorStatus
): Promise<Validator> {
  console.debug("Fetching a single validator's details");

  const addressAsString = address.toString();
  const api = await getPolkadotApiPromise(rpcEndpoint);
  const currentEra = (await api.query.staking.currentEra()).unwrap();
  const identity = await getValidatorIdentity(rpcEndpoint, addressAsString);
  const exposure = await api.query.staking.erasStakers(currentEra, address);
  const commission = await getValidatorCommission(rpcEndpoint, addressAsString);

  // Self-staked amount.
  const selfStakedAmount = exposure.own.unwrap();
  const selfStakedBalance = formatTokenBalance(selfStakedAmount);

  // Effective amount staked (total).
  const totalStakeAmount = exposure.total.unwrap();
  const effectiveAmountStaked = formatTokenBalance(totalStakeAmount);

  // Delegations = total # of nominators.
  const delegationCount = await getTotalNumberOfNominators(
    rpcEndpoint,
    addressAsString
  );

  return {
    address: addressAsString,
    identityName: identity,
    selfStaked: selfStakedBalance,
    effectiveAmountStaked,
    effectiveAmountStakedRaw: totalStakeAmount.toString(),
    delegations: delegationCount.toString(),
    commission,
    status,
  };
}
