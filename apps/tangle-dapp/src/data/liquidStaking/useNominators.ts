import useApiRx from '@webb-tools/tangle-shared-ui/hooks/useApiRx';
import { SubstrateAddress } from '@webb-tools/webb-ui-components/types/address';
import assertSubstrateAddress from '@webb-tools/webb-ui-components/utils/assertSubstrateAddress';
import { useCallback, useMemo } from 'react';

const useNominators = (): Map<SubstrateAddress, SubstrateAddress[]> | null => {
  const { result: entries } = useApiRx(
    useCallback((api) => {
      return api.query.staking.nominators.entries();
    }, []),
  );

  const keyValuePairs = useMemo(() => {
    if (entries === null) {
      return null;
    }

    return entries.flatMap(([key, value]) => {
      // Ignore empty values.
      if (value.isNone) {
        return [];
      }

      const targets = value
        .unwrap()
        .targets.map((accountId) =>
          assertSubstrateAddress(accountId.toString()),
        );

      const nominatorAddress = assertSubstrateAddress(key.args[0].toString());

      return [[nominatorAddress, targets]] as const;
    });
  }, [entries]);

  const map = useMemo(() => {
    if (entries === null) {
      return null;
    }

    return new Map<SubstrateAddress, SubstrateAddress[]>(keyValuePairs);
  }, [entries, keyValuePairs]);

  return map;
};

export default useNominators;
