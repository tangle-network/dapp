'use client';

import { useActiveAccount } from '@webb-tools/api-provider-environment/hooks/useActiveAccount';
import { useActiveChain } from '@webb-tools/api-provider-environment/hooks/useActiveChain';
import { ArrowRight } from '@webb-tools/icons';
import { calculateTypedChainId } from '@webb-tools/sdk-core/typed-chain-id';
import useNetworkStore from '@webb-tools/tangle-shared-ui/context/useNetworkStore';
import {
  Card,
  EMPTY_VALUE_PLACEHOLDER,
  ChainOrTokenButton,
  Label,
  Modal,
  ModalContent,
  useModal,
  Typography,
  Button,
} from '@webb-tools/webb-ui-components';
import { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { Decimal } from 'decimal.js';

import AmountInput from '../../components/AmountInput';
import { AssetConfig, AssetList } from '../../components/Lists/AssetList';
import { ChainList } from '../../components/Lists/ChainList';
import useBridgeStore from '../../context/bridge/useBridgeStore';
import useBalances from '../../data/balances/useBalances';
import { useEVMBalances } from '../../data/bridge/useEVMBalances';
import { TokenBalanceType } from '../../data/bridge/useEVMBalances';
import useSwitchChain from '../../hooks/useSwitchChain';
import formatTangleBalance from '../../utils/formatTangleBalance';
import useActiveTypedChainId from '../../hooks/useActiveTypedChainId';
import { PresetTypedChainId } from '@webb-tools/dapp-types';
import {
  EVMTokenBridgeEnum,
  EVMTokenEnum,
} from '@webb-tools/evm-contract-metadata';
import AddressInput, { AddressType } from '../../components/AddressInput';
import { makeExplorerUrl } from '@webb-tools/api-provider-environment/transaction/utils';
import convertDecimalToBn from '../../utils/convertDecimalToBn';

interface BridgeContainerProps {
  className?: string;
}

export default function BridgeContainer({ className }: BridgeContainerProps) {
  const [activeChain] = useActiveChain();
  const [activeAccount] = useActiveAccount();
  const switchChain = useSwitchChain();
  const activeTypedChainId = useActiveTypedChainId();
  const { transferable: balance } = useBalances();
  const { nativeTokenSymbol } = useNetworkStore();

  const accountBalance = balance
    ? formatTangleBalance(balance, nativeTokenSymbol).split(' ')[0]
    : '';

  const { balances } = useEVMBalances();

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
  const destinationAddress = useBridgeStore(
    (state) => state.destinationAddress,
  );
  const setDestinationAddress = useBridgeStore(
    (state) => state.setDestinationAddress,
  );

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
    setSelectedSourceChain(selectedDestinationChain);
    setSelectedDestinationChain(selectedSourceChain);
  };

  const assets: AssetConfig[] = useMemo(() => {
    const tokenConfigs = tokens.map((token) => {
      const sourceTypedChainId = calculateTypedChainId(
        selectedSourceChain.chainType,
        selectedSourceChain.id,
      );

      const balance =
        sourceTypedChainId === PresetTypedChainId.TangleMainnetEVM
          ? accountBalance
          : balances?.[sourceTypedChainId]?.find(
              (tokenBalance: TokenBalanceType) =>
                tokenBalance.address === token.address,
            )?.balance;

      const selectedChainExplorerUrl =
        selectedSourceChain.blockExplorers?.default;

      const tokenExplorerUrl = makeExplorerUrl(
        selectedChainExplorerUrl?.url ?? '',
        token.address,
        'address',
        'web3',
      );

      return {
        symbol: token.tokenType,
        optionalSymbol: token.tokenSymbol,
        balance: balance ? parseFloat(balance.toString()).toFixed(3) : '',
        explorerUrl:
          sourceTypedChainId !== PresetTypedChainId.TangleMainnetEVM
            ? tokenExplorerUrl
            : undefined,
        address: token.address,
        assetBridgeType:
          sourceTypedChainId === PresetTypedChainId.TangleMainnetEVM
            ? ''
            : token.bridgeType === EVMTokenBridgeEnum.Router
              ? '(Router Protocol)'
              : token.bridgeType === EVMTokenBridgeEnum.Hyperlane
                ? '(Hyperlane)'
                : '',
      };
    });

    return tokenConfigs;
  }, [tokens, selectedSourceChain.chainType, selectedSourceChain.id, balances]);

  const onSelectToken = (asset: AssetConfig) => {
    const tokenConfig = tokens.find((token) => token.address === asset.address);
    if (tokenConfig) {
      setSelectedToken(tokenConfig);
    }
  };

  const selectedTokenBalanceOnSourceChain = useMemo(() => {
    const balance = assets.find(
      (asset) => asset.address === selectedToken.address,
    )?.balance;

    return balance ? parseFloat(balance) : 0;
  }, [selectedSourceChain, selectedToken, assets]);

  const balanceBridgeType = useMemo(() => {
    const sourceTypedChainId = calculateTypedChainId(
      selectedSourceChain.chainType,
      selectedSourceChain.id,
    );

    return sourceTypedChainId === PresetTypedChainId.TangleMainnetEVM
      ? ''
      : selectedToken.bridgeType === EVMTokenBridgeEnum.Router
        ? '(Router Protocol)'
        : selectedToken.bridgeType === EVMTokenBridgeEnum.Hyperlane
          ? '(Hyperlane)'
          : '';
  }, [selectedSourceChain, selectedToken]);

  return (
    <>
      <Card
        withShadow
        className={twMerge(
          'flex flex-col gap-7 w-full max-w-[560px] mx-auto',
          className,
        )}
      >
        <div className="flex flex-col gap-7">
          {/* Source and Destination Chain Selector */}
          <div className="flex flex-col md:flex-row justify-center md:justify-between items-center md:items-end md:gap-3">
            <div className="flex flex-col gap-2 flex-1 w-full">
              <Label
                className="text-mono-120 dark:text-mono-120 font-bold text-lg"
                htmlFor="bridge-source-chain-selector"
              >
                From
              </Label>
              <ChainOrTokenButton
                value={
                  selectedSourceChain.displayName ?? selectedSourceChain.name
                }
                className="w-full min-h-[70px] dark:bg-mono-180 py-0"
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
                className="text-mono-120 dark:text-mono-120 font-bold text-lg"
                htmlFor="bridge-destination-chain-selector"
              >
                To
              </Label>
              <ChainOrTokenButton
                value={
                  selectedDestinationChain.displayName ??
                  selectedDestinationChain.name
                }
                className="w-full min-h-[70px] dark:bg-mono-180 py-0"
                iconType="chain"
                onClick={openDestinationChainModal}
                disabled={destinationChains.length <= 1}
                textClassName="leading-8 text-[20px]"
              />
            </div>
          </div>

          {/* Sending Amount and Token Selector */}
          <div className="flex flex-col gap-2">
            <div
              className={twMerge(
                'w-full flex items-center gap-2 rounded-lg pr-4',
                'bg-mono-20 dark:bg-mono-180',
                isAmountInputError && 'border border-red-70 dark:border-red-50',
              )}
            >
              <AmountInput
                id="bridge-amount-input"
                title="Send"
                amount={amount}
                setAmount={setAmount}
                wrapperOverrides={{
                  isFullWidth: true,
                }}
                placeholder=""
                wrapperClassName="!pr-0 !border-0 dark:bg-mono-180"
                max={
                  balance
                    ? convertDecimalToBn(
                        new Decimal(selectedTokenBalanceOnSourceChain),
                        selectedToken.decimals,
                      )
                    : null
                }
                maxErrorMessage="Insufficient balance"
                // min={}
                decimals={selectedToken.decimals}
                minErrorMessage="Amount too small"
                setErrorMessage={(error) =>
                  setIsAmountInputError(error ? true : false)
                }
              />
              <ChainOrTokenButton
                value={selectedToken.tokenType}
                iconType="token"
                onClick={openTokenModal}
                className="w-fit py-2"
                status="success"
              />
            </div>

            <div className="flex flex-col gap-1 justify-center items-end">
              <Typography variant="body1">
                Balance:{' '}
                {selectedTokenBalanceOnSourceChain !== null
                  ? `${Number(selectedTokenBalanceOnSourceChain).toFixed(3)} ${selectedToken.tokenType} ${balanceBridgeType}`
                  : EMPTY_VALUE_PLACEHOLDER}
              </Typography>
            </div>
          </div>

          {/* Address Input */}
          <AddressInput
            id="bridge-destination-address-input"
            type={AddressType.EVM}
            title="Recipient"
            wrapperOverrides={{
              isFullWidth: true,
              wrapperClassName: 'dark:bg-mono-180',
            }}
            value={destinationAddress ?? ''}
            setValue={setDestinationAddress}
            // setErrorMessage={(error) =>
            //   setIsAddressInputError(error ? true : false)
            // }
          />

          {/* Bridge Button */}
          <Button
            isFullWidth
            // isDisabled={isDisabled}
            // isLoading={isLoading}
            // onClick={buttonAction}
            // loadingText={buttonLoadingText}
          >
            Bridge
            {/* {buttonText} */}
          </Button>
        </div>
      </Card>

      <Modal>
        {/* Source Chain Selector */}
        <ModalContent
          isOpen={isSourceChainModalOpen}
          onInteractOutside={closeSourceChainModal}
          size="md"
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
          size="md"
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
          size="md"
        >
          <AssetList
            onClose={closeTokenModal}
            assets={assets}
            onSelectAsset={onSelectToken}
          />
        </ModalContent>
      </Modal>
    </>
  );
}
