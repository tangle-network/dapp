import { Currency, TypedChainId } from '@webb-dapp/api-providers';
import { useWebContext } from '@webb-dapp/react-environment';
import { useCallback, useEffect, useMemo, useState } from 'react';

export const useBridge = () => {
  const { activeApi } = useWebContext();
  const bridgeApi = useMemo(() => activeApi?.methods.bridgeApi, [activeApi]);

  return {
    bridgeApi,
  };
};
