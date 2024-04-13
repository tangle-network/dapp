import { ApiPromise } from '@polkadot/api';

import useApi from './useApi';

const useApiOnce = <T>(fetcher: (api: ApiPromise) => T) => {
  const api = useApi();
};
