'use client';

import {
  ArrowDownIcon,
  ClipboardIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { PresetTypedChainId } from '@webb-tools/dapp-types';
import { ArrowRight, ChainIcon, TokenIcon } from '@webb-tools/icons';
import { calculateTypedChainId } from '@webb-tools/sdk-core/typed-chain-id';
import {
  Card,
  ChainOrTokenButton,
  Label,
  Modal,
  ModalContent,
  notificationApi,
  useModal,
} from '@webb-tools/webb-ui-components';
import { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import AmountInput from '../../components/AmountInput';
import { AssetConfig } from '../../components/Lists/AssetList';
import { ChainList } from '../../components/Lists/ChainList';
import { BRIDGE_CHAINS } from '../../constants/bridge/constants';
import useBridgeStore from '../../context/bridge/useBridgeStore';
import { useEVMBalances } from '../../data/bridge/useEVMBalances';
import { TokenBalanceType } from '../../data/bridge/useEVMBalances';
import useActiveAccountAddress from '../../hooks/useActiveAccountAddress';
import { ActionButton } from './ActionButton';
import { IconButton } from './IconButton';
import { SelectCard } from './SelectCard';
import { TokenAmountInput } from './TokenAmountInput';
import { BN } from 'bn.js';

interface BridgeContainerProps {
  className?: string;
}

export default function BridgeContainer({ className }: BridgeContainerProps) {
  const activeAccountAddress = useActiveAccountAddress();

  const { balances, isLoading, error } = useEVMBalances();

  if (!isLoading && !error) {
    // const b = balances[PresetTypedChainId.Polygon];
    // if (b) {
    //   b.forEach((token) => {
    //     console.debug(token.tokenSymbol, token.balance.toString());
    //   });
    // }
    // console.debug('balances', balances);
  }

  console.debug('isLoading', isLoading);
  console.debug('error', error);

  const sourceChains = useBridgeStore((state) => state.sourceChains);
  const destinationChains = useBridgeStore((state) => state.destinationChains);
  const selectedSourceChain = useBridgeStore(
    (state) => state.selectedSourceChain,
  );
  const setSelectedSourceChain = useBridgeStore(
    (state) => state.setSelectedSourceChain,
  );
  const selectedDestinationChain = useBridgeStore(
    (state) => state.selectedDestinationChain,
  );
  const setSelectedDestinationChain = useBridgeStore(
    (state) => state.setSelectedDestinationChain,
  );
  const tokens = useBridgeStore((state) => state.tokens);
  const selectedToken = useBridgeStore((state) => state.selectedToken);
  const setSelectedToken = useBridgeStore((state) => state.setSelectedToken);
  const amount = useBridgeStore((state) => state.amount);
  const setAmount = useBridgeStore((state) => state.setAmount);
  const isAmountInputError = useBridgeStore(
    (state) => state.isAmountInputError,
  );
  const setIsAmountInputError = useBridgeStore(
    (state) => state.setIsAmountInputError,
  );

  // console.debug('sourceChains', sourceChains);
  // console.debug('destinationChains', destinationChains);
  // console.debug('selectedSourceChain', selectedSourceChain.name);
  // console.debug('selectedDestinationChain', selectedDestinationChain.name);

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
  const {
    status: isTokenModalOpen,
    open: openTokenModal,
    close: closeTokenModal,
  } = useModal(false);

  const onSwitchChains = () => {
    const selectedDestinationChainPresetTypedChainId = calculateTypedChainId(
      selectedDestinationChain.chainType,
      selectedDestinationChain.id,
    );

    if (
      Object.keys(BRIDGE_CHAINS).includes(
        selectedDestinationChainPresetTypedChainId.toString(),
      )
    ) {
      setSelectedSourceChain(selectedDestinationChain);
    } else {
      notificationApi({
        variant: 'warning',
        message: `Bridging from ${selectedDestinationChain.name} is not supported`,
      });
    }
  };

  console.debug('tokens', tokens);

  const assets: AssetConfig[] = useMemo(() => {
    const tokenConfigs = tokens.map((token) => {
      const typedChainId = calculateTypedChainId(
        selectedSourceChain.chainType,
        selectedSourceChain.id,
      );

      const balance = balances?.[typedChainId]?.find(
        (tokenBalance: TokenBalanceType) =>
          tokenBalance.address === token.address,
      )?.balance;

      return {
        symbol: token.tokenType,
        optionalSymbol: token.tokenSymbol,
        balance: balance ?? undefined,
        explorerUrl: '',
        address: token.address,
      };
    });

    return tokenConfigs;
  }, [tokens, balances, selectedSourceChain]);

  const selectedTokenBalance = useMemo(() => {
    const typedChainId = calculateTypedChainId(
      selectedSourceChain.chainType,
      selectedSourceChain.id,
    );

    console.debug('balances?.[typedChainId]', typedChainId);

    return balances?.[typedChainId]?.find(
      (tokenBalance: TokenBalanceType) =>
        tokenBalance.address === selectedToken.address,
    );
  }, [balances, selectedSourceChain, selectedToken]);

  console.debug('selectedTokenBalance', selectedTokenBalance);

  const handleSwitchChains = () => {
    const tempSourceChain = selectedSourceChain;
    const destChainTypedId = calculateTypedChainId(
      selectedDestinationChain.chainType,
      selectedDestinationChain.id,
    );

    if (Object.keys(BRIDGE_CHAINS).includes(destChainTypedId.toString())) {
      setSelectedSourceChain(selectedDestinationChain);
      setSelectedDestinationChain(tempSourceChain);
    } else {
      notificationApi({
        variant: 'warning',
        message: `Bridging from ${selectedDestinationChain.name} is not supported`,
      });
    }
  };

  const handleAmountChange = (value: string) => {
    // Allow any numeric input
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      try {
        const newAmount = value === '' ? null : new BN(value);
        setAmount(newAmount);

        // Just check if amount exceeds balance but don't prevent input
        const myBalance = selectedTokenBalance?.balance || new BN(0);
        if (newAmount) {
          setIsAmountInputError(newAmount.gt(myBalance));
        } else {
          setIsAmountInputError(false);
        }
      } catch (e) {
        // Handle invalid number conversion
        setIsAmountInputError(true);
      }
    }
  };

  const handleMaxClick = () => {
    if (selectedTokenBalance?.balance) {
      setAmount(selectedTokenBalance.balance);
      setIsAmountInputError(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-4">
      <Card
        withShadow
        className={twMerge(
          'w-full max-w-[480px] mx-auto p-4',
          'bg-mono-0 dark:bg-mono-180',
          className,
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-mono-200 dark:text-mono-0">
            Bridge
          </h1>
        </div>

        {/* Chain Selectors */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1">
            <SelectCard
              label="From"
              icon={<ChainIcon name={selectedSourceChain.name} size="2xl" />}
              title={
                selectedSourceChain.displayName ?? selectedSourceChain.name
              }
              onClick={openSourceChainModal}
              // Remove the disabled condition
              disabled={false}
            />
          </div>

          <button
            onClick={handleSwitchChains}
            className="p-2 rounded-full bg-mono-20 hover:bg-mono-40 dark:bg-mono-160 dark:hover:bg-mono-140 transition-colors mt-7"
            disabled={!selectedDestinationChain || sourceChains.length <= 1}
          >
            <ArrowDownIcon className="w-4 h-4 text-mono-200 dark:text-mono-0 -rotate-90" />
          </button>

          <div className="flex-1">
            <SelectCard
              label="To"
              icon={
                selectedDestinationChain ? (
                  <ChainIcon
                    name={selectedDestinationChain.displayName}
                    size="2xl"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-mono-40 dark:bg-mono-140" />
                )
              }
              title={
                selectedDestinationChain
                  ? (selectedDestinationChain.displayName ??
                    selectedDestinationChain.name)
                  : 'Select chain'
              }
              onClick={openDestinationChainModal}
              disabled={destinationChains.length <= 1}
            />
          </div>
        </div>

        {/* Amount Input */}
        <TokenAmountInput
          tokenIcon={<TokenIcon name={selectedToken.tokenType} size="2xl" />}
          tokenSymbol={selectedToken.tokenSymbol}
          onTokenClick={openTokenModal}
          amount={amount?.toString() ?? ''}
          onAmountChange={handleAmountChange}
          balance={selectedTokenBalance?.balance.toString()}
          maxAmount={selectedTokenBalance?.balance.toString()}
          onMaxClick={handleMaxClick}
          error={isAmountInputError}
          usdValue={amount ? `$${0.0}` : undefined} // TODO: Implement price calculation
        />

        {/* Error Message */}
        {isAmountInputError && (
          <div className="flex items-center gap-2 p-2 mt-2 rounded-lg bg-red-10 dark:bg-red-120/20">
            <ExclamationTriangleIcon className="w-4 h-4 text-red-70 dark:text-red-50" />
            <span className="text-sm text-red-70 dark:text-red-50">
              Insufficient funds
            </span>
          </div>
        )}

        {/* Bridge Button */}
        <ActionButton
          onClick={() => {
            /* TODO: Implement bridge action */
          }}
          disabled={!amount || amount.isZero() || !selectedDestinationChain}
          loading={false}
          className="mt-4"
        >
          {isAmountInputError ? 'Insufficient funds' : 'Bridge'}
        </ActionButton>
      </Card>
      {/* Modals */}
      <Modal>
        {/* Source Chain Selector */}
        <ModalContent
          isOpen={isSourceChainModalOpen}
          onInteractOutside={closeSourceChainModal}
          size="sm"
          className="bg-mono-0 dark:bg-mono-180"
        >
          <ChainList
            searchInputId="bridge-source-chain-search"
            onClose={closeSourceChainModal}
            chains={sourceChains}
            onSelectChain={setSelectedSourceChain}
            chainType="source"
          />
        </ModalContent>

        {/* Destination Chain Selector */}
        <ModalContent
          isOpen={isDestinationChainModalOpen}
          onInteractOutside={closeDestinationChainModal}
          size="sm"
          className="bg-mono-0 dark:bg-mono-180"
        >
          <ChainList
            searchInputId="bridge-destination-chain-search"
            onClose={closeDestinationChainModal}
            chains={destinationChains}
            onSelectChain={setSelectedDestinationChain}
            chainType="destination"
          />
        </ModalContent>

        {/* Token Selector */}
        <ModalContent
          isOpen={isTokenModalOpen}
          onInteractOutside={closeTokenModal}
          size="sm"
          className="bg-mono-0 dark:bg-mono-180"
        >
          {/* <AssetList
            onClose={closeTokenModal}
            assets={assets}
            onSelectAsset={setSelectedToken}
          /> */}
        </ModalContent>
      </Modal>
    </div>
  );
}
