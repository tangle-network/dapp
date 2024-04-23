'use client';

import { useCallback } from 'react';
import { map } from 'rxjs/operators';

import usePolkadotApiRx from '../../hooks/usePolkadotApiRx';

export default function useJobIdAndTypeLookupByValidator(
  validatorAddress: string
) {
  return usePolkadotApiRx(
    useCallback(
      (api) => {
        return api.query.jobs.validatorJobIdLookup(validatorAddress).pipe(
          map((lookupData) => {
            if (lookupData.isNone) return [];
            return lookupData.unwrap().map((item) => {
              const [type, id] = item;
              return {
                // Note: No need to convert the type here since this will be used in
                // functions to get data for a specific job, not display on the UI
                type,
                id,
              };
            });
          })
        );
      },
      [validatorAddress]
    )
  );
}
