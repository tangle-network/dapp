import { useWebContext } from '@webb-tools/api-provider-environment';
import { useObservableState } from 'observable-hooks';
import { useMemo } from 'react';
import { of } from 'rxjs';

const NULL$ = of(null);

/**
 * Retrieve the active typed chain id state
 * from the active api in the web context.
 *
 * @returns the active typed chain id state or null
 * if there is no active api.
 */
export default function useActiveTypedChainId() {
  const { activeApi } = useWebContext();

  const typedChainId$ = useMemo(
    () => activeApi?.typedChainidSubject ?? NULL$,
    [activeApi],
  );

  return useObservableState(typedChainId$, null);
}
