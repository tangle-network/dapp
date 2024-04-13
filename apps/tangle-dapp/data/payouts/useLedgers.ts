import { useCallback } from 'react';

import useEntryMap from '../../hooks/useEntryMap';
import useApiRx from '../../hooks/useApiRx';

const useLedgers = () => {
  const { data: ledgers, ...other } = useApiRx(
    useCallback((api) => api.query.staking.ledger.entries(), [])
  );

  const ledgerMap = useEntryMap(ledgers, (key) => key.args[0].toString());

  return { data: ledgerMap, ...other };
};

export default useLedgers;
