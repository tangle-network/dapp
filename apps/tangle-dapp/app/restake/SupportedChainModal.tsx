import chainsPopulated from '@webb-tools/dapp-config/chains/chainsPopulated';
import type { ComponentProps } from 'react';

import { SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS } from '../../constants/restake';
import useActiveTypedChainId from '../../hooks/useActiveTypedChainId';
import ChainList from './ChainList';
import ModalContent from './ModalContent';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onChainChange: ComponentProps<typeof ChainList>['onChange'];
};

const SupportedChainModal = ({ isOpen, onChainChange, onClose }: Props) => {
  const activeTypedChainId = useActiveTypedChainId();

  return (
    <ModalContent
      isOpen={isOpen}
      title="Select Chain"
      description="Select the chain you want to delegate from"
      onInteractOutside={onClose}
    >
      <ChainList
        selectedTypedChainId={activeTypedChainId}
        className="h-full"
        onClose={onClose}
        onChange={onChainChange}
        defaultCategory={
          chainsPopulated[SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS[0]].tag
        }
      />
    </ModalContent>
  );
};

export default SupportedChainModal;
