import { chainsConfig } from '@webb-tools/dapp-config';
import type { ComponentProps } from 'react';
import React from 'react';

import { ChainList } from '../../components/Lists/ChainList';
import { SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS } from '../../constants/restake';
import ModalContent from './ModalContent';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onChainChange: ComponentProps<typeof ChainList>['onSelectChain'];
};

const SupportedChainModal: React.FC<Props> = ({
  isOpen,
  onChainChange,
  onClose,
}) => {
  return (
    <ModalContent
      isOpen={isOpen}
      title="Select Chain"
      description="Select the chain you want to delegate from"
      onInteractOutside={onClose}
    >
      <ChainList
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
