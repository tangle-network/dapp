import { useCallback } from 'react';

import usePolkadotApi from '../../hooks/usePolkadotApi';

const useHistoryDepth = () => {
  return usePolkadotApi(
    useCallback(async (api) => {
      const historyDepth = await api.consts.staking.historyDepth;
      return historyDepth.toBn();
    }, [])
  );
};

export default useHistoryDepth;
