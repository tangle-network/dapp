import { chainsConfig } from '@webb-tools/dapp-config';
import type { ComponentProps, FC } from 'react';

import { ChainList } from '../../components/Lists/ChainList';
import { SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS } from '../../constants/restake';
import { ModalContent } from '@webb-tools/webb-ui-components';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onChainChange: ComponentProps<typeof ChainList>['onSelectChain'];
};

const SupportedChainModal: FC<Props> = ({ isOpen, onChainChange, onClose }) => {
  return (
    <ModalContent
      isOpen={isOpen}
      title="Select Chain"
      onInteractOutside={onClose}
    >
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
