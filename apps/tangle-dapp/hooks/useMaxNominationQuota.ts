import { useEffect, useState } from 'react';

import useNetworkStore from '../context/useNetworkStore';
import { getMaxNominationQuota } from '../utils/polkadot';

const useMaxNominationQuota = () => {
  const [maxNominationQuota, setMaxNominationQuota] = useState(0);
  const { rpcEndpoint } = useNetworkStore();

  useEffect(() => {
    async function fetchMaxNominationQuota() {
      const quota = await getMaxNominationQuota(rpcEndpoint);

      if (typeof quota === 'number' && !isNaN(quota) && quota > 0) {
        setMaxNominationQuota(quota);
      } else {
        setMaxNominationQuota(16);
      }
    }

    fetchMaxNominationQuota();
  }, [rpcEndpoint]);

  return maxNominationQuota;
};

export default useMaxNominationQuota;
