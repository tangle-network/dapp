'use client';

import { useWebContext } from '@webb-tools/api-provider-environment/webb-context/webb-context';
import ChainButtonCmp from '@webb-tools/webb-ui-components/components/buttons/ChainButton';
import { useMemo } from 'react';

const ChainSelector = () => {
  const { activeChain, activeAccount } = useWebContext();

  const chain = useMemo(() => {
    if (activeChain) {
      return activeChain;
    }
  }, [activeChain]);

  return (
    <>
      {activeAccount && chain && (
        <ChainButtonCmp
          chain={chain}
          status="success"
          placeholder={activeChain === null ? 'Unsupported Chain' : undefined}
          textClassname="hidden lg:block"
          disabled
        />
      )}
    </>
  );
};

export default ChainSelector;
