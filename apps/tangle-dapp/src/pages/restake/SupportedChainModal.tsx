import { chainsConfig } from '@tangle-network/dapp-config';
import type { ComponentProps, FC } from 'react';

import { ChainList } from '../../components/Lists/ChainList';
import { SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS } from '../../constants/restake';
import { ModalContent } from '@tangle-network/ui-components';

type Props = {
  onClose: () => void;
  onChainChange: ComponentProps<typeof ChainList>['onSelectChain'];
};

const SupportedChainModal: FC<Props> = ({ onChainChange, onClose }) => {
  return (
    <ModalContent title="Select Chain">
      <ChainList
        searchInputId="restake-supported-chain-search"
        chains={SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS.map(
          (typedChainId) => ({
            ...chainsConfig[typedChainId],
            typedChainId,
          }),
        )}
        onClose={onClose}
        onSelectChain={onChainChange}
        chainType="source"
      />
    </ModalContent>
  );
};

export default SupportedChainModal;
