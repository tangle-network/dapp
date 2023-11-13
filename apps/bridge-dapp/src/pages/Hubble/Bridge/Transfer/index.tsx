import { Transition } from '@headlessui/react';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import {
  AccountCircleLineIcon,
  ArrowRight,
  ClipboardLineIcon,
  FileCopyLine,
  GasStationFill,
  SettingsFillIcon,
} from '@webb-tools/icons';
import { useBalancesFromNotes } from '@webb-tools/react-hooks/currency/useBalancesFromNotes';
import { calculateTypedChainId } from '@webb-tools/sdk-core/typed-chain-id';
import {
  Button,
  ConnectWalletMobileButton,
  IconWithTooltip,
  TextField,
  TitleWithInfo,
  ToggleCard,
  TransactionInputCard,
  useCheckMobile,
  useCopyable,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import { FC, useCallback, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router';
import { formatEther, parseEther } from 'viem';
import SlideAnimation from '../../../../components/SlideAnimation';
import RelayerFeeDetails from '../../../../components/RelayerFeeDetails';
import {
  ACTION_BUTTON_PROPS,
  BRIDGE_TABS,
  SELECT_DESTINATION_CHAIN_PATH,
  SELECT_RELAYER_PATH,
  SELECT_SHIELDED_POOL_PATH,
  SELECT_SOURCE_CHAIN_PATH,
} from '../../../../constants';
import BridgeTabsContainer from '../../../../containers/BridgeTabsContainer';
import TxInfoContainer from '../../../../containers/TxInfoContainer';
import useChainsFromRoute from '../../../../hooks/useChainsFromRoute';
import useCurrenciesFromRoute from '../../../../hooks/useCurrenciesFromRoute';
import useNavigateWithPersistParams from '../../../../hooks/useNavigateWithPersistParams';
import useRelayerWithRoute from '../../../../hooks/useRelayerWithRoute';
import useTransferFeeCalculation from '../../../../hooks/useTransferFeeCalculation';
import useInputs from './private/useInputs';
import useTransferButtonProps from './private/useTransferButtonProps';
import { ConnectWalletMobileContent } from '../../../../components';

const Transfer = () => {
  const { pathname } = useLocation();

  const { balances } = useBalancesFromNotes();

  const navigate = useNavigateWithPersistParams();

  const { isMobile } = useCheckMobile();

  const { activeAccount, activeChain, noteManager } = useWebContext();

  const { notificationApi } = useWebbUI();

  const {
    amount,
    hasRefund,
    recipient,
    recipientErrorMsg,
    refundRecipient,
    refundRecipientErrorMsg,
    setAmount,
    setHasRefund,
    setRecipient,
    setRefundRecipient,
  } = useInputs();

  const { srcChainCfg, srcTypedChainId, destChainCfg, destTypedChainId } =
    useChainsFromRoute();

  const { fungibleCfg } = useCurrenciesFromRoute();

  const fungibleMaxAmount = useMemo(() => {
    if (typeof srcTypedChainId !== 'number') {
      return;
    }

    if (fungibleCfg && balances[fungibleCfg.id]?.[srcTypedChainId]) {
      return Number(formatEther(balances[fungibleCfg.id][srcTypedChainId]));
    }
  }, [balances, fungibleCfg, srcTypedChainId]);

  const handleChainClick = useCallback(
    (destChain?: boolean) => {
      navigate(
        destChain ? SELECT_DESTINATION_CHAIN_PATH : SELECT_SOURCE_CHAIN_PATH
      );
    },
    [navigate]
  );

  const handleTokenClick = useCallback(() => {
    navigate(SELECT_SHIELDED_POOL_PATH);
  }, [navigate]);

  const handlePasteButtonClick = useCallback(async () => {
    try {
      const addr = await window.navigator.clipboard.readText();

      setRecipient(addr);
    } catch (e) {
      notificationApi({
        message: 'Failed to read clipboard',
        secondaryMessage:
          'Please change your browser settings to allow clipboard access.',
        variant: 'warning',
      });
    }
  }, [notificationApi, setRecipient]);

  const handleSendToSelfRefundClick = useCallback(() => {
    if (!activeAccount) {
      notificationApi({
        message: 'Failed to get account',
        secondaryMessage: 'Please connect your wallet first.',
        variant: 'warning',
      });
      return;
    }

    setRefundRecipient(activeAccount.address);
  }, [activeAccount, notificationApi, setRefundRecipient]);

  const handleSendToSelfClick = useCallback(() => {
    if (!noteManager) {
      notificationApi({
        message: 'Failed to get note account',
        secondaryMessage: 'Please create a note account first.',
        variant: 'warning',
      });
      return;
    }
    const noteAccPub = noteManager.getKeypair().toString();
    setRecipient(noteAccPub);
  }, [noteManager, notificationApi, setRecipient]);

  const typedChainId = useMemo(() => {
    if (typeof srcTypedChainId === 'number') {
      return srcTypedChainId;
    }

    if (activeChain) {
      return calculateTypedChainId(activeChain.chainType, activeChain.id);
    }
  }, [activeChain, srcTypedChainId]);

  const activeRelayer = useRelayerWithRoute(typedChainId);

  const {
    gasFeeInfo,
    isLoading: isFeeLoading,
    refundAmount,
    relayerFeeInfo,
    resetMaxFeeInfo,
    totalFeeToken,
    totalFeeWei,
  } = useTransferFeeCalculation({
    typedChainId: typedChainId,
    activeRelayer,
    recipientErrorMsg,
    refundRecipientError: refundRecipientErrorMsg,
  });

  const receivingAmount = useMemo(() => {
    if (!amount) {
      return 0;
    }

    const parsedAmount = parseFloat(amount);
    if (!activeRelayer) {
      return parsedAmount;
    }

    if (typeof totalFeeWei !== 'bigint') {
      return parsedAmount;
    }

    const remain = parseEther(amount) - totalFeeWei;
    return parseFloat(formatEther(remain));
  }, [activeRelayer, amount, totalFeeWei]);

  const remainingBalance = useMemo(() => {
    if (!fungibleCfg?.id || !srcTypedChainId) {
      return;
    }

    const balance = balances[fungibleCfg.id]?.[srcTypedChainId];
    if (typeof balance !== 'bigint') {
      return;
    }

    if (!amount) {
      return Number(formatEther(balance));
    }

    const remain = balance - parseEther(amount);
    if (remain < 0) {
      return;
    }

    return Number(formatEther(remain));
  }, [amount, balances, fungibleCfg?.id, srcTypedChainId]);

  const { transferConfirmComponent, ...buttonProps } = useTransferButtonProps({
    balances,
    receivingAmount,
    isFeeLoading,
    totalFeeWei,
    feeToken: totalFeeToken,
    activeRelayer,
    refundAmount,
    refundToken: destChainCfg?.nativeCurrency.symbol,
    resetFeeInfo: resetMaxFeeInfo,
    refundRecipientError: refundRecipientErrorMsg,
  });

  const lastPath = useMemo(() => pathname.split('/').pop(), [pathname]);
  if (lastPath && !BRIDGE_TABS.find((tab) => lastPath === tab)) {
    return <Outlet />;
  }

  if (transferConfirmComponent !== null) {
    return (
      <SlideAnimation key={`transfer-confirm`}>
        {transferConfirmComponent}
      </SlideAnimation>
    );
  }

  return (
    <BridgeTabsContainer>
      <div className="flex flex-col space-y-4 grow">
        <div className="space-y-2">
          <TransactionInputCard.Root
            typedChainId={srcTypedChainId ?? undefined}
            tokenSymbol={fungibleCfg?.symbol}
            maxAmount={fungibleMaxAmount}
            amount={amount}
            onAmountChange={setAmount}
          >
            <TransactionInputCard.Header>
              <TransactionInputCard.ChainSelector
                onClick={() => handleChainClick()}
              />
              <TransactionInputCard.MaxAmountButton accountType="note" />
            </TransactionInputCard.Header>

            <TransactionInputCard.Body
              tokenSelectorProps={{
                placeHolder: 'Select pool',
                onClick: () => handleTokenClick(),
              }}
            />
          </TransactionInputCard.Root>

          <ArrowRight size="lg" className="mx-auto rotate-90" />

          <TransactionInputCard.Root
            typedChainId={destTypedChainId ?? undefined}
            tokenSymbol={fungibleCfg?.symbol}
            amount={receivingAmount.toString().slice(0, 10)}
          >
            <TransactionInputCard.Header>
              <TransactionInputCard.ChainSelector
                onClick={() => handleChainClick(true)}
              />
              <TransactionInputCard.Button
                Icon={<SettingsFillIcon />}
                onClick={() => navigate(SELECT_RELAYER_PATH)}
              >
                Relayer
              </TransactionInputCard.Button>
            </TransactionInputCard.Header>

            <TransactionInputCard.Body
              tokenSelectorProps={{
                placeHolder: 'Select pool',
                onClick: () => handleTokenClick(),
              }}
              customAmountProps={{
                isDisabled: true,
                className: 'text-mono-200 dark:text-mono-0 cursor-not-allowed',
              }}
            />
          </TransactionInputCard.Root>

          <div className="flex gap-2">
            <div className="w-0 space-y-2 duration-200 ease-in-out grow shrink basic-0">
              <TitleWithInfo title="Recipient Shielded Account" />
              <RecipientInput
                error={recipientErrorMsg}
                value={recipient}
                onValueChange={setRecipient}
                onPasteButtonClick={handlePasteButtonClick}
                onSendToSelfClick={handleSendToSelfClick}
              />
            </div>

            <Transition
              className="w-0 space-y-2 grow shrink basis-0"
              show={hasRefund}
              enter="transition-opacity duration-200"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <TitleWithInfo
                title="Refund Wallet Address"
                info="The wallet address to receive the refund."
              />
              <RecipientInput
                error={refundRecipientErrorMsg}
                value={refundRecipient}
                onValueChange={setRefundRecipient}
                onPasteButtonClick={handlePasteButtonClick}
                onSendToSelfClick={handleSendToSelfRefundClick}
              />
            </Transition>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-4 grow">
          <div className="space-y-4">
            <ToggleCard
              title="Enable refund"
              Icon={<GasStationFill size="lg" />}
              description={
                destChainCfg
                  ? `Get ${destChainCfg.nativeCurrency.symbol} on transactions on ${destChainCfg.name}`
                  : undefined
              }
              className="max-w-none"
              switcherProps={{
                checked: hasRefund,
                disabled: !activeRelayer,
                onCheckedChange: () => setHasRefund((prev) => !prev),
              }}
            />

            <RelayerFeeDetails
              totalFeeWei={totalFeeWei}
              totalFeeToken={totalFeeToken}
              gasFeeInfo={gasFeeInfo}
              relayerFeeInfo={relayerFeeInfo}
              isFeeLoading={isFeeLoading}
              srcChainCfg={srcChainCfg}
              fungibleCfg={fungibleCfg}
              activeRelayer={activeRelayer}
            />

            <TxInfoContainer
              hasRefund={hasRefund}
              refundAmount={
                typeof refundAmount === 'bigint'
                  ? formatEther(refundAmount)
                  : undefined
              }
              refundToken={destChainCfg?.nativeCurrency.symbol}
              newBalance={remainingBalance}
              newBalanceToken={fungibleCfg?.symbol}
              txType="transfer"
            />
          </div>

          {!isMobile ? (
            <Button loadingText="Connecting..." {...buttonProps} isFullWidth />
          ) : (
            <ConnectWalletMobileButton
              title="Try Hubble on Desktop"
              extraActionButtons={ACTION_BUTTON_PROPS}
              isFullWidth
            >
              <ConnectWalletMobileContent />
            </ConnectWalletMobileButton>
          )}
        </div>
      </div>
    </BridgeTabsContainer>
  );
};

export default Transfer;

type RecipientInputProps = {
  error?: string;
  value: string;
  onValueChange: (value: string) => void;
  onSendToSelfClick: () => void;
  onPasteButtonClick: () => void;
};

const RecipientInput: FC<RecipientInputProps> = ({
  onPasteButtonClick,
  onSendToSelfClick,
  onValueChange,
  value,
  error,
}) => {
  const { copy, isCopied } = useCopyable();

  return (
    <TextField.Root className="max-w-none" error={error}>
      <TextField.Input
        placeholder="0x..."
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
      />

      <TextField.Slot>
        {value ? (
          <IconWithTooltip
            icon={<FileCopyLine size="lg" className="!fill-current" />}
            content={isCopied ? 'Copied' : 'Copy'}
            overrideTooltipTriggerProps={{
              onClick: isCopied ? undefined : () => copy(value),
            }}
          />
        ) : (
          <>
            <IconWithTooltip
              icon={
                <AccountCircleLineIcon size="lg" className="!fill-current" />
              }
              content="Send to self"
              overrideTooltipTriggerProps={{
                onClick: onSendToSelfClick,
              }}
            />
            <IconWithTooltip
              icon={<ClipboardLineIcon size="lg" className="!fill-current" />}
              content="Patse from clipboard"
              overrideTooltipTriggerProps={{
                onClick: onPasteButtonClick,
              }}
            />
          </>
        )}
      </TextField.Slot>
    </TextField.Root>
  );
};
