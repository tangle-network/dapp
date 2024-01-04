import { useEffect, useState } from 'react';

import { getMaxNominationQuota } from '../constants';

const useMaxNominationQuota = () => {
  const [maxNominationQuota, setMaxNominationQuota] = useState<number>(0);

  useEffect(() => {
    async function fetchMaxNominationQuota() {
      const quota = await getMaxNominationQuota();

      if (typeof quota === 'number' && !isNaN(quota) && quota > 0) {
        setMaxNominationQuota(quota);
      } else {
        setMaxNominationQuota(16);
      }
    }

    fetchMaxNominationQuota();
  }, []);

  return maxNominationQuota;
};

export default useMaxNominationQuota;
