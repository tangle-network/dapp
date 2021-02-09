import { get, isEmpty, noop } from 'lodash';
import { useEffect, useState } from 'react';

import { useAccounts } from './useAccounts';
import { useApi } from './useApi';

interface Options {
  onSuccess?: () => void;
  onError?: () => void;
}

/**
 * @name useIsAppReady
 * @description check app status, return true when chain connected and has active account, in ohter case return false.
 */
export const useIsAppReady = (options?: Options): boolean => {
  const [appReadyStatus, setAppReadyStatus] = useState<boolean>(false);
  const { api } = useApi();
  const { active: activeAccount, authRequired } = useAccounts();

  useEffect(() => {
    const accountStatus = !authRequired || (!!activeAccount && !!activeAccount.address);

    const status = accountStatus && !isEmpty(api);

    // handle onSuccess or onError callback
    (status ? get(options, 'onSuccess', noop) : get(options, 'onError', noop))();

    if (status !== appReadyStatus) {
      setAppReadyStatus(status);
    }
    /* eslint-disable-next-line */
  }, [authRequired, activeAccount, api, options]);

  return appReadyStatus;
};
