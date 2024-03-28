import { notificationApi } from '@webb-tools/webb-ui-components';
import { useEffect } from 'react';

const useErrorReporting = (
  failureMessage: string | null,
  ...errors: Array<Error | unknown>
) => {
  useEffect(() => {
    for (const error of errors) {
      if (!(error instanceof Error)) {
        continue;
      }

      if (failureMessage !== null) {
        notificationApi({
          variant: 'error',
          message: failureMessage,
          secondaryMessage: error.message,
        });
      } else {
        notificationApi({
          variant: 'error',
          message: error.message,
        });
      }
    }
  }, [errors, failureMessage]);
};

export default useErrorReporting;
