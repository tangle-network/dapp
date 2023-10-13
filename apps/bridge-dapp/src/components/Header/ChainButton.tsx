import { useWebContext } from '@webb-tools/api-provider-environment/webb-context/webb-context';
import ChainButtonCmp from '@webb-tools/webb-ui-components/components/buttons/ChainButton';
import { BRIDGE_PATH, SELECT_SOURCE_CHAIN_PATH } from '../../constants';
import useNavigateWithPersistParams from '../../hooks/useNavigateWithPersistParams';

const ChainButton = () => {
  const { activeChain } = useWebContext();

  const navigate = useNavigateWithPersistParams();

  return (
    <ChainButtonCmp
      chain={activeChain ?? undefined}
      status="success"
      placeholder={activeChain === null ? 'Unsupported Chain' : undefined}
      onClick={() => navigate(`/${BRIDGE_PATH}/${SELECT_SOURCE_CHAIN_PATH}`)}
    />
  );
};

export default ChainButton;
