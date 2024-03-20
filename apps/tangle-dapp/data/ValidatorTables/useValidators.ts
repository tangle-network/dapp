import { AccountId32 } from '@polkadot/types/interfaces';
import { BN_ZERO } from '@polkadot/util';
import { useCallback, useMemo } from 'react';

import usePolkadotApiRx from '../../hooks/usePolkadotApiRx';
import { Validator } from '../../types';
import { formatTokenBalance } from '../../utils/polkadot';
import useCurrentEra from '../staking/useCurrentEra';
import useValidatorIdentityNames from './useValidatorIdentityNames';

export const useValidators = (
  addresses: AccountId32[] | null,
  status: 'Active' | 'Waiting'
): Validator[] | null => {
  console.debug('Fetching validator data (v2)');

  const { data: currentEra } = useCurrentEra();
  const { data: identityNames } = useValidatorIdentityNames();

  const { data: exposures } = usePolkadotApiRx(
    useCallback(
      (api) =>
        currentEra === null
          ? null
          : api.query.staking.erasStakers.entries(currentEra),
      [currentEra]
    )
  );

  const { data: nominations } = usePolkadotApiRx(
    useCallback((api) => api.query.staking.nominators.entries(), [])
  );

  return useMemo(() => {
    if (
      addresses === null ||
      identityNames === null ||
      exposures === null ||
      nominations === null
    ) {
      return [];
    }

    return addresses.map((address) => {
      // Default to the address if no identity name is registered.
      const name =
        identityNames.find((identity) => identity[0] === address)?.[1] ??
        address.toString();

      // Match the exposure entry for the current validator
      // by comparing the address in the exposure entry with the
      // current validator's address.
      const exposure = exposures.find((exposure) =>
        exposure[0].args[1].eq(address)
      )?.[1];

      const selfStakedAmount = exposure?.own.unwrap() ?? BN_ZERO;
      const totalStakeAmount = exposure?.total.unwrap() ?? BN_ZERO;

      const nominators = nominations.filter(([, nominatorData]) => {
        if (nominatorData.isNone) {
          return false;
        }

        const nominations = nominatorData.unwrap();

        return (
          nominations.targets &&
          nominations.targets.some((target) => target.eq(address))
        );
      });

      return {
        address: address.toString(),
        identityName: name,
        selfStaked: formatTokenBalance(selfStakedAmount),
        effectiveAmountStaked: formatTokenBalance(totalStakeAmount),
        effectiveAmountStakedRaw: totalStakeAmount.toString(),
        // TODO: This shouldn't be a string. No reason for it.
        delegations: nominators.length.toString(),
        // TODO: This shouldn't be a string?
        commission: '0',
        status,
      };
    });
  }, [addresses, exposures, identityNames, nominations, status]);
};
