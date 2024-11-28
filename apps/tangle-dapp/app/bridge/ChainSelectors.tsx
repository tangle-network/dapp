'use client';

import { calculateTypedChainId } from '@webb-tools/dapp-types/TypedChainId';
import { ArrowRight } from '@webb-tools/icons/ArrowRight';
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
    <div className="flex flex-col items-center justify-center md:flex-row md:justify-between md:items-end md:gap-3">
      {/* Source Chain Selector */}
      <div className="flex flex-col flex-1 gap-2">
        <Label
          className="font-bold text-mono-120 dark:text-mono-120"
          htmlFor="bridge-source-chain-selector"
        >
          From
        </Label>

        <ChainOrTokenButton
          value={selectedSourceChain.name}
          className="w-full min-h-[72px] dark:bg-mono-180"
          iconType="chain"
          onClick={openSourceChainModal}
          disabled={sourceChainOptions.length <= 1}
        />
      </div>

      <div
        className="flex-shrink px-1 pt-5 cursor-pointer md:pt-0 md:pb-5"
        onClick={onSwitchChains}
      >
        <ArrowRight size="lg" className="rotate-90 md:rotate-0" />
      </div>

      {/* Destination Chain Selector */}
      <div className="flex flex-col flex-1 gap-2">
        <Label
          className="font-bold text-mono-120 dark:text-mono-120"
          htmlFor="bridge-destination-chain-selector"
        >
          To
        </Label>

        <ChainOrTokenButton
          value={selectedDestinationChain.name}
          className="w-full min-h-[72px] dark:bg-mono-180"
          iconType="chain"
          onClick={openDestinationChainModal}
          disabled={destinationChainOptions.length <= 1}
        />
      </div>

      <Modal>
        {/* Source Chain Modal */}
        <ModalContent
          isOpen={isSourceChainModalOpen}
          onInteractOutside={closeSourceChainModal}
          size="sm"
        >
          <ChainList
            searchInputId="bridge-source-chain-search"
            onClose={closeSourceChainModal}
            chains={sourceChainOptions}
            onSelectChain={setSelectedSourceChain}
            chainType="source"
          />
        </ModalContent>

        {/* Destination Chain Modal */}
        <ModalContent
          isOpen={isDestinationChainModalOpen}
          onInteractOutside={closeDestinationChainModal}
          size="sm"
        >
          <ChainList
            searchInputId="bridge-destination-chain-search"
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
