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
  FeeDetails,
  IconWithTooltip,
  TextField,
  TitleWithInfo,
  ToggleCard,
  TransactionInputCard,
  useCheckMobile,
  useCopyable,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import { FeeItem } from '@webb-tools/webb-ui-components/components/FeeDetails/types';
import { useCallback, useEffect, useMemo } from 'react';
import { Outlet, useLocation, useSearchParams } from 'react-router-dom';
import { formatEther, parseEther } from 'viem';
import SlideAnimation from '../../../../components/SlideAnimation';
import {
  BRIDGE_TABS,
  DEST_CHAIN_KEY,
  NO_RELAYER_KEY,
  POOL_KEY,
  SELECT_DESTINATION_CHAIN_PATH,
  SELECT_RELAYER_PATH,
  SELECT_SHIELDED_POOL_PATH,
  SELECT_TOKEN_PATH,
  TOKEN_KEY,
} from '../../../../constants';
import {
  CUSTOM_AMOUNT_TOOLTIP_CONTENT,
  FIXED_AMOUNT_TOOLTIP_CONTENT,
} from '../../../../constants/tooltipContent';
import BridgeTabsContainer from '../../../../containers/BridgeTabsContainer';
import TxInfoContainer from '../../../../containers/TxInfoContainer';
import useNavigateWithPersistParams from '../../../../hooks/useNavigateWithPersistParams';
import useFeeCalculation from './private/useFeeCalculation';
import useInputs from './private/useInputs';
import useRelayerWithRoute from './private/useRelayerWithRoute';
import useWithdrawButtonProps from './private/useWithdrawButtonProps';

const Withdraw = () => {
  const { pathname } = useLocation();

  const navigate = useNavigateWithPersistParams();

  const { isMobile } = useCheckMobile();

  const [searchParams, setSearchParams] = useSearchParams();

  const { balances, initialized } = useBalancesFromNotes();

  const {
    apiConfig,
    activeApi,
    activeAccount,
    activeChain,
    loading,
    isConnecting,
  } = useWebContext();

  const { notificationApi } = useWebbUI();

  const { copy, isCopied } = useCopyable();

  const {
    amount,
    hasRefund,
    isCustom,
    recipient,
    recipientErrorMsg,
    setAmount,
    setHasRefund,
    setIsCustom,
    setRecipient,
  } = useInputs();

  const { activeRelayer } = useRelayerWithRoute();

  const [destTypedChainId, poolId, tokenId, noRelayer] = useMemo(() => {
    const destTypedId = parseInt(searchParams.get(DEST_CHAIN_KEY) ?? '');

    const poolId = parseInt(searchParams.get(POOL_KEY) ?? '');
    const tokenId = parseInt(searchParams.get(TOKEN_KEY) ?? '');

    const noRelayer = searchParams.get(NO_RELAYER_KEY);

    return [
      Number.isNaN(destTypedId) ? undefined : destTypedId,
      Number.isNaN(poolId) ? undefined : poolId,
      Number.isNaN(tokenId) ? undefined : tokenId,
      Boolean(noRelayer),
    ];
  }, [searchParams]);

  const [fungibleCfg, wrappableCfg] = useMemo(() => {
    return [
      typeof poolId === 'number' ? apiConfig.currencies[poolId] : undefined,
      typeof tokenId === 'number' ? apiConfig.currencies[tokenId] : undefined,
    ];
  }, [poolId, tokenId, apiConfig.currencies]);

  const fungibleMaxAmount = useMemo(() => {
    if (!destTypedChainId) {
      return;
    }

    if (fungibleCfg && balances[fungibleCfg.id]?.[destTypedChainId]) {
      return Number(formatEther(balances[fungibleCfg.id][destTypedChainId]));
    }
  }, [balances, destTypedChainId, fungibleCfg]);

  const activeBridge = useMemo(() => {
    return activeApi?.state.activeBridge;
  }, [activeApi?.state.activeBridge]);

  const destChainCfg = useMemo(() => {
    if (typeof destTypedChainId !== 'number') {
      return;
    }

    return apiConfig.chains[destTypedChainId];
  }, [apiConfig.chains, destTypedChainId]);

  // Set default poolId and destTypedChainId on first render
  useEffect(
    () => {
      if (loading || isConnecting || !initialized) {
        return;
      }

      if (typeof destTypedChainId === 'number' && typeof poolId === 'number') {
        return;
      }

      const entries = Object.entries(balances);
      if (entries.length > 0) {
        // Find first pool & destTypedChainId from balances
        const [currencyId, balanceRecord] = entries[0];
        const [typedChainId] = Object.entries(balanceRecord)?.[0] ?? [];

        if (currencyId && typedChainId) {
          setSearchParams((prev) => {
            const params = new URLSearchParams(prev);

            if (typeof destTypedChainId !== 'number') {
              params.set(DEST_CHAIN_KEY, typedChainId);
            }

            if (typeof poolId !== 'number') {
              params.set(POOL_KEY, currencyId);
            }

            return params;
          });
          return;
        }
      }

      if (activeChain && activeBridge) {
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);

          const typedChainId = calculateTypedChainId(
            activeChain.chainType,
            activeChain.id
          );

          if (typeof destTypedChainId !== 'number') {
            next.set(DEST_CHAIN_KEY, `${typedChainId}`);
          }

          if (typeof poolId !== 'number') {
            next.set(POOL_KEY, `${activeBridge.currency.id}`);
          }

          return next;
        });
        return;
      }

      // Here is when no balances and active connection
      const [defaultPool, anchors] = Object.entries(apiConfig.anchors)[0];
      const [defaultTypedId] = Object.entries(anchors)[0];

      const nextParams = new URLSearchParams();
      if (typeof poolId !== 'number' && defaultPool) {
        nextParams.set(POOL_KEY, defaultPool);
      }

      if (typeof destTypedChainId !== 'number' && defaultTypedId) {
        nextParams.set(DEST_CHAIN_KEY, defaultTypedId);
      }

      setSearchParams(nextParams);
    },
    // prettier-ignore
    [activeBridge, activeChain, apiConfig.anchors, balances, destTypedChainId, initialized, isConnecting, loading, poolId, setSearchParams]
  );

  // If no active relayer, reset refund states
  useEffect(() => {
    if (!activeRelayer && hasRefund) {
      setHasRefund('');
    }
  }, [activeRelayer, hasRefund, setHasRefund]);

  const handleChainClick = useCallback(() => {
    navigate(SELECT_DESTINATION_CHAIN_PATH);
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
    resetMaxFeeInfo,
    totalFeeToken,
    totalFeeWei,
  } = useFeeCalculation({ activeRelayer, recipientErrorMsg });

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
    if (!poolId || !destTypedChainId) {
      return;
    }

    const balance = balances[poolId]?.[destTypedChainId];
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
  }, [amount, balances, destTypedChainId, poolId]);

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
            typedChainId={destTypedChainId}
            tokenSymbol={fungibleCfg?.symbol}
            maxAmount={fungibleMaxAmount}
            amount={amount}
            onAmountChange={setAmount}
            isFixedAmount={!isCustom}
            onIsFixedAmountChange={() =>
              setIsCustom((prev) => (prev.length > 0 ? '' : '1'))
            }
          >
            <TransactionInputCard.Header>
              <TransactionInputCard.ChainSelector onClick={handleChainClick} />
              <TransactionInputCard.MaxAmountButton />
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
            typedChainId={destTypedChainId}
            tokenSymbol={wrappableCfg?.symbol}
            amount={amount}
            onAmountChange={setAmount}
            isFixedAmount={!isCustom}
            onIsFixedAmountChange={() =>
              setIsCustom((prev) => (prev.length > 0 ? '' : '1'))
            }
          >
            <TransactionInputCard.Header>
              <TransactionInputCard.ChainSelector onClick={handleChainClick} />
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
                destChainCfg
                  ? `Get ${destChainCfg.nativeCurrency.symbol} on transactions on ${destChainCfg.name}`
                  : undefined
              }
              className="max-w-none"
              switcherProps={{
                checked: !!hasRefund,
                disabled: !activeRelayer,
                onCheckedChange: () =>
                  setHasRefund((prev) => (prev.length > 0 ? '' : '1')),
              }}
            />

            <FeeDetails
              isTotalLoading={isFeeLoading}
              totalFee={
                typeof totalFeeWei === 'bigint'
                  ? parseFloat(formatEther(totalFeeWei))
                  : undefined
              }
              totalFeeToken={
                typeof totalFeeWei === 'bigint' ? totalFeeToken : undefined
              }
              items={
                [
                  typeof gasFeeInfo === 'bigint'
                    ? ({
                        name: 'Gas',
                        isLoading: isFeeLoading,
                        Icon: <GasStationFill />,
                        value: parseFloat(formatEther(gasFeeInfo)),
                        tokenSymbol: destChainCfg?.nativeCurrency.symbol,
                      } satisfies FeeItem)
                    : undefined,
                ].filter((item) => Boolean(item)) as Array<FeeItem>
              }
            />

            <TxInfoContainer
              hasRefund={!!hasRefund}
              refundAmount={
                typeof refundAmount === 'bigint'
                  ? formatEther(refundAmount)
                  : undefined
              }
              refundToken={activeChain?.nativeCurrency.symbol}
              remaining={remainingBalance}
              remainingToken={fungibleCfg?.symbol}
              receivingAmount={receivingAmount}
              receivingToken={wrappableCfg?.symbol}
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
