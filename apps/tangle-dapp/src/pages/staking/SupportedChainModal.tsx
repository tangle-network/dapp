import type { ComponentProps, FC } from 'react';

import { ChainList } from '../../components/Lists/ChainList';
import { SUPPORTED_STAKING_DEPOSIT_CHAINS } from '../../constants/staking';
import { ModalContent } from '@tangle-network/ui-components';

type Props = {
  onClose: () => void;
  onChainChange: ComponentProps<typeof ChainList>['onSelectChain'];
};

const SupportedChainModal: FC<Props> = ({ onChainChange, onClose }) => {
  return (
    <ModalContent title="Select Chain">
      <ChainList
        searchInputId="staking-supported-chain-search"
        chains={SUPPORTED_STAKING_DEPOSIT_CHAINS}
        onClose={onClose}
        onSelectChain={onChainChange}
        chainType="source"
      />
    </ModalContent>
  );
};

export default SupportedChainModal;
