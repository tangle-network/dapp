'use client';

import { PresetTypedChainId } from '@webb-tools/dapp-types';
import { ArrowRight } from '@webb-tools/icons';
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

  return (
    <>
      <Card
        withShadow
        className={twMerge(
          'flex flex-col gap-7 w-full max-w-[590px] mx-auto',
          className,
        )}
      >
        <div className="flex flex-col gap-7">
          {/* Source and Destination Chain Selector */}
          <div className="flex flex-col md:flex-row justify-center md:justify-between items-center md:items-end md:gap-3">
            <div className="flex flex-col gap-2 flex-1 w-full">
              <Label
                className="text-mono-120 dark:text-mono-120 font-bold"
                htmlFor="bridge-source-chain-selector"
              >
                From
              </Label>
              <ChainOrTokenButton
                value={
                  selectedSourceChain.displayName ?? selectedSourceChain.name
                }
                className="w-full min-h-[72px] dark:bg-mono-180 py-0"
                iconType="chain"
                onClick={openSourceChainModal}
                disabled={sourceChains.length <= 1}
                textClassName="leading-8 text-[20px]"
              />
            </div>
            <div
              className="flex-shrink cursor-pointer px-1 pt-5 md:pt-0 md:pb-5"
              onClick={onSwitchChains}
            >
              <ArrowRight size="lg" className="rotate-90 md:rotate-0" />
            </div>
            <div className="flex flex-col gap-2 flex-1 w-full">
              <Label
                className="text-mono-120 dark:text-mono-120 font-bold"
                htmlFor="bridge-destination-chain-selector"
              >
                To
              </Label>
              <ChainOrTokenButton
                value={
                  selectedDestinationChain.displayName ??
                  selectedDestinationChain.name
                }
                className="w-full min-h-[72px] dark:bg-mono-180 py-0"
                iconType="chain"
                onClick={openDestinationChainModal}
                disabled={destinationChains.length <= 1}
                textClassName="leading-8 text-[20px]"
              />
            </div>
          </div>

          {/* Sending Amount and Token Selector */}
          <div className="flex flex-col gap-2 justify-center items-end">
            <div
              className={twMerge(
                'w-full flex items-center gap-2 rounded-lg pr-4',
                'bg-mono-20 dark:bg-mono-180',
                isAmountInputError && 'border border-red-70 dark:border-red-50',
              )}
            >
              <AmountInput
                id="bridge-amount-input"
                title="Sending"
                amount={amount}
                setAmount={setAmount}
                wrapperOverrides={{
                  isFullWidth: true,
                }}
                placeholder=""
                wrapperClassName="!pr-0 !border-0 dark:bg-mono-180"
                // max={balance ? convertDecimalToBn(balance, decimals) : null}
                maxErrorMessage="Insufficient balance"
                // min={minAmount ? convertDecimalToBn(minAmount, decimals) : null}
                // decimals={decimals}
                minErrorMessage="Amount too small"
                setErrorMessage={(error) =>
                  setIsAmountInputError(error ? true : false)
                }
              />
              <ChainOrTokenButton
                value={selectedToken.tokenType}
                // displayValue={selectedToken.tokenSymbol}
                iconType="token"
                onClick={openTokenModal}
                className="w-fit"
                status="success"
              />
            </div>
          </div>

          {/* Receiving Amount and Token Selector */}
          {/* <div className="flex flex-col gap-2 justify-center items-end">
            <div
              className={twMerge(
                'w-full flex items-center gap-2 rounded-lg pr-4',
                'bg-mono-20 dark:bg-mono-180',
              )}
            >
              <AmountInput
                id="bridge-receiving-amount-input"
                title="Receiving"
                amount={amount}
                setAmount={() => void 0}
                wrapperOverrides={{
                  isFullWidth: true,
                }}
                placeholder=''
                wrapperClassName="!pr-0 !border-0 dark:bg-mono-180"
                isDisabled={true}
                showMaxAction={false}
                errorOnEmptyValue={false}
              />
              <ChainOrTokenButton
                value="WETH"
                iconType="token"
                className="min-w-[130px]"
                status="success"
                disabled={true}
              />
            </div>
          </div> */}
        </div>
      </Card>

      <Modal>
        {/* Source Chain Selector */}
        <ModalContent
          isOpen={isSourceChainModalOpen}
          onInteractOutside={closeSourceChainModal}
          size="sm"
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
        >
          {/* <AssetList
            onClose={closeTokenModal}
            assets={assets}
            onSelectAsset={setSelectedToken}
          /> */}
        </ModalContent>
      </Modal>
    </>
  );
}
