import { useEffect, useState } from 'react';

import useRpcEndpointStore from '../context/useRpcEndpointStore';
import { getMaxNominationQuota } from '../utils/polkadot';

const useMaxNominationQuota = () => {
  const [maxNominationQuota, setMaxNominationQuota] = useState(0);
  const { rpcEndpoint } = useRpcEndpointStore();

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
