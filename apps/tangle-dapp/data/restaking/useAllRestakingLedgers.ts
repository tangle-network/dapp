import { useCallback } from 'react';

import useApiRx from '../../hooks/useApiRx';
import useEntryMap from '../../hooks/useEntryMap';

const useAllRestakingLedgers = () => {
  const { result: restakingLedgers, ...other } = useApiRx(
    useCallback((api) => api.query.roles.ledger.entries(), []),
  );

  const ledgerMap = useEntryMap(
    restakingLedgers,
    useCallback((key) => key.args[0].toString(), []),
  );

  return { result: ledgerMap, ...other };
};

export default useAllRestakingLedgers;
