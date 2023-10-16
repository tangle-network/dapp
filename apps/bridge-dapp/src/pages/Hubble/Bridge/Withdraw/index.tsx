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
import { useCallback, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BooleanParam, useQueryParam } from 'use-query-params';
import { formatEther, parseEther } from 'viem';
import RelayerFeeDetails from '../../../../components/RelayerFeeDetails';
import SlideAnimation from '../../../../components/SlideAnimation';
import {
  BRIDGE_TABS,
  NO_RELAYER_KEY,
  SELECT_RELAYER_PATH,
  SELECT_SHIELDED_POOL_PATH,
  SELECT_SOURCE_CHAIN_PATH,
  SELECT_TOKEN_PATH,
} from '../../../../constants';
import {
  CUSTOM_AMOUNT_TOOLTIP_CONTENT,
  FIXED_AMOUNT_TOOLTIP_CONTENT,
} from '../../../../constants/tooltipContent';
import BridgeTabsContainer from '../../../../containers/BridgeTabsContainer';
import TxInfoContainer from '../../../../containers/TxInfoContainer';
import useChainsFromRoute from '../../../../hooks/useChainsFromRoute';
import useCurrenciesFromRoute from '../../../../hooks/useCurrenciesFromRoute';
import useNavigateWithPersistParams from '../../../../hooks/useNavigateWithPersistParams';
import useRelayerWithRoute from '../../../../hooks/useRelayerWithRoute';
import useFeeCalculation from './private/useFeeCalculation';
import useInputs from './private/useInputs';
import useWithdrawButtonProps from './private/useWithdrawButtonProps';

const Withdraw = () => {
  const { pathname } = useLocation();

  const navigate = useNavigateWithPersistParams();

  const { isMobile } = useCheckMobile();

  const { balances } = useBalancesFromNotes();

  const { activeAccount, activeChain } = useWebContext();

  const { notificationApi } = useWebbUI();

  const { copy, isCopied } = useCopyable();

  const {
    amount,
    hasRefund,
    isCustom,
    recipient,
    recipientErrorMsg,
    setAmount,
    setCustomAmount,
    setHasRefund,
    setRecipient,
  } = useInputs();

  const [noRelayer] = useQueryParam(NO_RELAYER_KEY, BooleanParam);

  const { fungibleCfg, wrappableCfg } = useCurrenciesFromRoute();
  const { srcChainCfg, srcTypedChainId } = useChainsFromRoute();

  const typedChainId = useMemo(() => {
    if (typeof srcTypedChainId === 'number') {
      return srcTypedChainId;
    }

    if (activeChain) {
      return calculateTypedChainId(activeChain.chainType, activeChain.id);
    }
  }, [activeChain, srcTypedChainId]);

  const activeRelayer = useRelayerWithRoute(typedChainId);

  const fungibleMaxAmount = useMemo(() => {
    if (typeof srcTypedChainId !== 'number') {
      return;
    }

    if (fungibleCfg && balances[fungibleCfg.id]?.[srcTypedChainId]) {
      return Number(formatEther(balances[fungibleCfg.id][srcTypedChainId]));
    }
  }, [balances, fungibleCfg, srcTypedChainId]);

  const handleChainClick = useCallback(() => {
    navigate(SELECT_SOURCE_CHAIN_PATH);
  }, [navigate]);

  const handleTokenClick = useCallback(
    (isShielded?: boolean) => {
      navigate(isShielded ? SELECT_SHIELDED_POOL_PATH : SELECT_TOKEN_PATH);
    },
    [navigate]
  );

  const handlePasteButtonClick = useCallback(async () => {
    try {
      const addr = await window.navigator.clipboard.readText();

      setRecipient(addr.slice(0, 200)); // limit to 200 chars
    } catch (e) {
      notificationApi({
        message: 'Failed to read clipboard',
        secondaryMessage:
          'Please change your browser settings to allow clipboard access.',
        variant: 'warning',
      });
    }
  }, [notificationApi, setRecipient]);

  const handleSendToSelfClick = useCallback(() => {
    if (!activeAccount) {
      notificationApi({
        message: 'Failed to get active account',
        secondaryMessage: 'Please check your wallet connection and try again.',
        variant: 'warning',
      });
      return;
    }

    setRecipient(activeAccount.address);
  }, [activeAccount, notificationApi, setRecipient]);

  const {
    gasFeeInfo,
    isLoading: isFeeLoading,
    refundAmount,
    relayerFeeInfo,
    resetMaxFeeInfo,
    totalFeeToken,
    totalFeeWei,
  } = useFeeCalculation({
    activeRelayer,
    recipientErrorMsg,
    typedChainId: srcTypedChainId,
  });

  const receivingAmount = useMemo(() => {
    if (!amount) {
      return;
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
    if (!fungibleCfg?.id || typeof srcTypedChainId !== 'number') {
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

  const { withdrawConfirmComponent, ...buttonProps } = useWithdrawButtonProps({
    balances,
    receivingAmount,
    isFeeLoading,
    totalFeeWei,
    refundAmount,
    resetFeeInfo: resetMaxFeeInfo,
  });

  const lastPath = useMemo(() => pathname.split('/').pop(), [pathname]);
  if (lastPath && !BRIDGE_TABS.find((tab) => lastPath === tab)) {
    return <Outlet />;
  }

  if (withdrawConfirmComponent !== null) {
    return (
      <SlideAnimation key={`withdraw-confirm`}>
        {withdrawConfirmComponent}
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
            isFixedAmount={!isCustom}
            onIsFixedAmountChange={() => setCustomAmount(!isCustom)}
          >
            <TransactionInputCard.Header>
              <TransactionInputCard.ChainSelector onClick={handleChainClick} />
              <TransactionInputCard.MaxAmountButton
                accountType="note"
                disabled={!isCustom}
              />
            </TransactionInputCard.Header>

            <TransactionInputCard.Body
              tokenSelectorProps={{
                placeHolder: 'Select pool',
                onClick: () => handleTokenClick(true),
              }}
              fixedAmountProps={{
                step: 0.01,
              }}
            />

            <TransactionInputCard.Footer
              labelWithTooltipProps={{
                info: isCustom
                  ? CUSTOM_AMOUNT_TOOLTIP_CONTENT
                  : FIXED_AMOUNT_TOOLTIP_CONTENT,
              }}
            />
          </TransactionInputCard.Root>

          <ArrowRight size="lg" className="mx-auto rotate-90" />

          <TransactionInputCard.Root
            typedChainId={srcTypedChainId ?? undefined}
            tokenSymbol={wrappableCfg?.symbol}
            amount={receivingAmount?.toString().slice(0, 10)}
            onAmountChange={setAmount}
            onIsFixedAmountChange={() => setCustomAmount(!isCustom)}
          >
            <TransactionInputCard.Header>
              <TransactionInputCard.ChainSelector
                onClick={handleChainClick}
                disabled
              />
              <TransactionInputCard.Button
                Icon={<SettingsFillIcon />}
                onClick={() => navigate(SELECT_RELAYER_PATH)}
              >
                {noRelayer ? 'No Relayer' : 'Relayer'}
              </TransactionInputCard.Button>
            </TransactionInputCard.Header>

            <TransactionInputCard.Body
              tokenSelectorProps={{
                onClick: () => handleTokenClick(),
              }}
              customAmountProps={{
                isDisabled: true,
                className: 'text-mono-200 dark:text-mono-0 cursor-not-allowed',
              }}
            />
          </TransactionInputCard.Root>

          <div className="flex gap-2">
            <div className="transition-[flex-grow] ease-in-out duration-200 space-y-2 grow">
              <TitleWithInfo title="Recipient Wallet Address" />

              <TextField.Root className="max-w-none" error={recipientErrorMsg}>
                <TextField.Input
                  placeholder="0x..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />

                <TextField.Slot>
                  {recipient ? (
                    <IconWithTooltip
                      icon={
                        <FileCopyLine size="lg" className="!fill-current" />
                      }
                      content={isCopied ? 'Copied' : 'Copy'}
                      overrideTooltipTriggerProps={{
                        onClick: isCopied ? undefined : () => copy(recipient),
                      }}
                    />
                  ) : (
                    <>
                      <IconWithTooltip
                        icon={
                          <AccountCircleLineIcon
                            size="lg"
                            className="!fill-current"
                          />
                        }
                        content="Send to self"
                        overrideTooltipTriggerProps={{
                          onClick: handleSendToSelfClick,
                        }}
                      />
                      <IconWithTooltip
                        icon={
                          <ClipboardLineIcon
                            size="lg"
                            className="!fill-current"
                          />
                        }
                        content="Patse from clipboard"
                        overrideTooltipTriggerProps={{
                          onClick: handlePasteButtonClick,
                        }}
                      />
                    </>
                  )}
                </TextField.Slot>
              </TextField.Root>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-4 grow">
          <div className="space-y-4">
            <ToggleCard
              title="Enable refund"
              Icon={<GasStationFill size="lg" />}
              description={
                srcChainCfg
                  ? `Get ${srcChainCfg.nativeCurrency.symbol} on transactions on ${srcChainCfg.name}`
                  : undefined
              }
              className="max-w-none"
              switcherProps={{
                checked: hasRefund,
                disabled: !activeRelayer,
                onCheckedChange: () => setHasRefund(!hasRefund),
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
              refundToken={activeChain?.nativeCurrency.symbol}
              remaining={remainingBalance}
              remainingToken={fungibleCfg?.symbol}
            />
          </div>

          {!isMobile ? (
            <Button loadingText="Connecting..." {...buttonProps} isFullWidth />
          ) : (
            <ConnectWalletMobileButton isFullWidth />
          )}
        </div>
      </div>
    </BridgeTabsContainer>
  );
};

export default Withdraw;
