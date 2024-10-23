'use client';

import { ArrowRight } from '@webb-tools/icons/ArrowRight';
import { calculateTypedChainId } from '@webb-tools/sdk-core/typed-chain-id';
import {
  Label,
  Modal,
  ModalContent,
  useModal,
} from '@webb-tools/webb-ui-components';
import ChainOrTokenButton from '@webb-tools/webb-ui-components/components/buttons/ChainOrTokenButton';
import assert from 'assert';
import { FC, useCallback } from 'react';

import { ChainList } from '../../components/Lists/ChainList';
import { BRIDGE } from '../../constants/bridge';
import { useBridge } from '../../context/BridgeContext';

const ChainSelectors: FC = () => {
  const {
    selectedSourceChain,
    setSelectedSourceChain,
    selectedDestinationChain,
    setSelectedDestinationChain,
    sourceChainOptions,
    destinationChainOptions,
    setAmount,
  } = useBridge();

  const {
    status: isSourceChainModalOpen,
    open: openSourceChainModal,
    close: closeSourceChainModal,
  } = useModal(false);

  const {
    status: isDestinationChainModalOpen,
    open: openDestinationChainModal,
    close: closeDestinationChainModal,
  } = useModal(false);

  const onSwitchChains = useCallback(() => {
    const newSelectedDestinationChain = selectedSourceChain;
    const newSelectedSourceChain = selectedDestinationChain;

    setAmount(null);

    assert(
      sourceChainOptions.find(
        (chain) =>
          calculateTypedChainId(chain.chainType, chain.id) ===
          calculateTypedChainId(
            newSelectedSourceChain.chainType,
            newSelectedSourceChain.id,
          ),
      ) !== undefined,
      'New source chain is not available in source chain options when switching chains',
    );
    setSelectedSourceChain(newSelectedSourceChain);

    const newDestinationChainOptions =
      BRIDGE[
        calculateTypedChainId(
          newSelectedSourceChain.chainType,
          newSelectedSourceChain.id,
        )
      ];
    const newDestinationChainPresetTypedChainId = calculateTypedChainId(
      newSelectedDestinationChain.chainType,
      newSelectedDestinationChain.id,
    );
    assert(
      newDestinationChainPresetTypedChainId in newDestinationChainOptions,
      'New destination chain is not available in destination chain options when switching chains',
    );
    setSelectedDestinationChain(newSelectedDestinationChain);
  }, [
    setSelectedSourceChain,
    setSelectedDestinationChain,
    selectedDestinationChain,
    selectedSourceChain,
    sourceChainOptions,
    setAmount,
  ]);

  return (
    <div className="flex flex-col md:flex-row justify-between items-end gap-3">
      {/* Source Chain Selector */}
      <div className="flex flex-col gap-2 w-full">
        <Label
          className="text-mono-120 dark:text-mono-120 font-bold"
          htmlFor="bridge-source-chain-selector"
        >
          From
        </Label>
        <ChainOrTokenButton
          value={selectedSourceChain.name}
          textClassName="text-xl"
          className="w-full !p-4 bg-mono-20 dark:bg-mono-170 border-0 hover:bg-mono-20 dark:hover:bg-mono-170 text-nowrap"
          iconType="chain"
          onClick={openSourceChainModal}
        />
      </div>

      <div className="cursor-pointer px-1 pb-[20px]" onClick={onSwitchChains}>
        <ArrowRight size="lg" className="rotate-90 md:rotate-0" />
      </div>

      {/* Destination Chain Selector */}
      <div className="flex flex-col gap-2 w-full">
        <Label
          className="text-mono-120 dark:text-mono-120 font-bold"
          htmlFor="bridge-destination-chain-selector"
        >
          To
        </Label>
        <ChainOrTokenButton
          value={selectedDestinationChain.name}
          textClassName="text-xl"
          className="w-full !p-4 bg-mono-20 dark:bg-mono-170 border-0 hover:bg-mono-20 dark:hover:bg-mono-170 text-nowrap"
          iconType="chain"
          onClick={openDestinationChainModal}
        />
      </div>

      <Modal>
        {/* Source Chain Modal */}
        <ModalContent
          isCenter
          isOpen={isSourceChainModalOpen}
          onInteractOutside={closeSourceChainModal}
          className="w-[500px] h-[600px]"
        >
          <ChainList
            onClose={closeSourceChainModal}
            chains={sourceChainOptions}
            onSelectChain={setSelectedSourceChain}
            chainType="source"
          />
        </ModalContent>

        {/* Destination Chain Modal */}
        <ModalContent
          isCenter
          isOpen={isDestinationChainModalOpen}
          onInteractOutside={closeDestinationChainModal}
          className="w-[500px] h-[600px]"
        >
          <ChainList
            onClose={closeDestinationChainModal}
            chains={destinationChainOptions}
            onSelectChain={setSelectedDestinationChain}
            chainType="destination"
          />
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ChainSelectors;
