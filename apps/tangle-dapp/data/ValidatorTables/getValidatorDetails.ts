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
  address: AccountId,
  status: ValidatorStatus
): Promise<Validator> {
  console.debug("Fetching a single validator's details");

  const addressAsString = address.toString();
  const api = await getPolkadotApiPromise();
  const currentEra = (await api.query.staking.currentEra()).unwrap();
  const identity = await getValidatorIdentity(addressAsString);
  const exposure = await api.query.staking.erasStakers(currentEra, address);
  const commission = await getValidatorCommission(addressAsString);

  // Self-staked amount.
  const selfStakedAmount = exposure.own.unwrap();
  const selfStakedBalance = formatTokenBalance(selfStakedAmount);

  // Effective amount staked (total).
  const totalStakeAmount = exposure.total.unwrap();
  const effectiveAmountStaked = formatTokenBalance(totalStakeAmount);

  // Delegations = total # of nominators.
  const delegationCount = await getTotalNumberOfNominators(addressAsString);

  return {
    address: addressAsString,
    identity,
    selfStaked: selfStakedBalance,
    effectiveAmountStaked,
    effectiveAmountStakedRaw: totalStakeAmount.toString(),
    delegations: delegationCount.toString(),
    commission,
    status,
  };
}
