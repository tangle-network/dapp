import { useCallback } from 'react';

import useApiRx from '../../hooks/useApiRx';
import useEntryMap from '../../hooks/useEntryMap';

const useAllLedgers = () => {
  const { result: ledgers, ...other } = useApiRx(
    useCallback((api) => api.query.staking.ledger.entries(), [])
  );

  const ledgerMap = useEntryMap(ledgers, (key) => key.args[0].toString());

  return { data: ledgerMap, ...other };
};

export default useAllLedgers;
