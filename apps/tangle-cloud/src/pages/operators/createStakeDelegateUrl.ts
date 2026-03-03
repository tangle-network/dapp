import { Address } from 'viem';
import { TangleDAppPagePath } from '../../types';

export const createStakeDelegateUrl = (operatorAddress?: Address): string => {
  const delegateUrl = new URL(TangleDAppPagePath.STAKING_DELEGATE);

  if (operatorAddress) {
    delegateUrl.searchParams.set('operator', operatorAddress);
  }

  return delegateUrl.toString();
};

export default createStakeDelegateUrl;
