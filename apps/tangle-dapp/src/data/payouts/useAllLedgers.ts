import useApiRx from '@tangle-network/tangle-shared-ui/hooks/useApiRx';
import { useCallback } from 'react';

import useEntryMap from '../../hooks/useEntryMap';

const useAllLedgers = () => {
  const { result: ledgers, ...other } = useApiRx(
    useCallback((api) => api.query.staking.ledger.entries(), []),
  );

  const ledgerMap = useEntryMap(ledgers, (key) => key.args[0].toString());

  return { data: ledgerMap, ...other };
};

export default useAllLedgers;
