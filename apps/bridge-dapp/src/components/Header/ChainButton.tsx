import { useWebContext } from '@webb-tools/api-provider-environment/webb-context/webb-context';
import ChainButtonCmp from '@webb-tools/webb-ui-components/components/buttons/ChainButton';
import { BRIDGE_PATH, SELECT_SOURCE_CHAIN_PATH } from '../../constants';
import useNavigateWithPersistParams from '../../hooks/useNavigateWithPersistParams';
import useChainsFromRoute from '../../hooks/useChainsFromRoute';
import { useMemo } from 'react';
import { chainsPopulated } from '@webb-tools/dapp-config';

const ChainButton = () => {
  const { activeChain } = useWebContext();
  const { srcTypedChainId } = useChainsFromRoute();

  const navigate = useNavigateWithPersistParams();

  const chain = useMemo(() => {
    if (activeChain) {
      return activeChain;
    }

    // Default to the chain from route if no active chain
    if (typeof srcTypedChainId === 'number' && activeChain !== null) {
      return chainsPopulated[srcTypedChainId];
    }
  }, [activeChain, srcTypedChainId]);

  return (
    <ChainButtonCmp
      chain={chain}
      status="success"
      placeholder={activeChain === null ? 'Unsupported Chain' : undefined}
      onClick={() => navigate(`/${BRIDGE_PATH}/${SELECT_SOURCE_CHAIN_PATH}`)}
      textClassname="hidden lg:block"
    />
  );
};

export default ChainButton;
