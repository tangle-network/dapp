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
  FeeDetails,
  IconWithTooltip,
  TextField,
  TitleWithInfo,
  ToggleCard,
  TransactionInputCard,
  useCopyable,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import { FeeItem } from '@webb-tools/webb-ui-components/components/FeeDetails/types';
import { FC, useCallback, useEffect, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { formatEther, parseEther } from 'viem';
import SlideAnimation from '../../../../components/SlideAnimation';
import {
  BRIDGE_TABS,
  DEST_CHAIN_KEY,
  POOL_KEY,
  SELECT_DESTINATION_CHAIN_PATH,
  SELECT_RELAYER_PATH,
  SELECT_SHIELDED_POOL_PATH,
  SELECT_SOURCE_CHAIN_PATH,
  SOURCE_CHAIN_KEY,
} from '../../../../constants';
import BridgeTabsContainer from '../../../../containers/BridgeTabsContainer';
import TxInfoContainer from '../../../../containers/TxInfoContainer';
import useNavigateWithPersistParams from '../../../../hooks/useNavigateWithPersistParams';
import useFeeCalculation from './private/useFeeCalculation';
import useInputs from './private/useInputs';
import useRelayerWithRoute from './private/useRelayerWithRoute';
import useTransferButtonProps from './private/useTransferButtonProps';

const Transfer = () => {
  const { pathname } = useLocation();

  const [searchParams, setSearchParams] = useSearchParams();

  const { balances, initialized } = useBalancesFromNotes();

  const navigate = useNavigateWithPersistParams();

  const {
    apiConfig,
    activeApi,
    activeChain,
    activeAccount,
    loading,
    isConnecting,
    noteManager,
  } = useWebContext();

  const { notificationApi } = useWebbUI();

  const {
    amount,
    hasRefund,
    isCustom,
    recipient,
    refundRecipient,
    setRefundRecipient,
    refundRecipientErrorMsg,
    recipientErrorMsg,
    setAmount,
    setHasRefund,
    setIsCustom,
    setRecipient,
  } = useInputs();

  const { activeRelayer } = useRelayerWithRoute();

  const [srcTypedChainId, destTypedChainId, poolId] = useMemo(() => {
    const srcTypedId = parseInt(searchParams.get(SOURCE_CHAIN_KEY) ?? '');
    const destTypedId = parseInt(searchParams.get(DEST_CHAIN_KEY) ?? '');

    const poolId = parseInt(searchParams.get(POOL_KEY) ?? '');

    return [
      Number.isNaN(srcTypedId) ? undefined : srcTypedId,
      Number.isNaN(destTypedId) ? undefined : destTypedId,
      Number.isNaN(poolId) ? undefined : poolId,
    ];
  }, [searchParams]);

  const [srcChainCfg, destChainCfg] = useMemo(() => {
    const src =
      typeof srcTypedChainId === 'number'
        ? apiConfig.chains[srcTypedChainId]
        : undefined;

    const dest =
      typeof destTypedChainId === 'number'
        ? apiConfig.chains[destTypedChainId]
        : undefined;

    return [src, dest];
  }, [apiConfig.chains, destTypedChainId, srcTypedChainId]);

  const fungibleCfg = useMemo(() => {
    return typeof poolId === 'number'
      ? apiConfig.currencies[poolId]
      : undefined;
  }, [poolId, apiConfig.currencies]);

  const fungibleMaxAmount = useMemo(() => {
    if (!srcTypedChainId) {
      return;
    }

    if (fungibleCfg && balances[fungibleCfg.id]?.[srcTypedChainId]) {
      return Number(formatEther(balances[fungibleCfg.id][srcTypedChainId]));
    }
  }, [balances, fungibleCfg, srcTypedChainId]);

  const activeBridge = useMemo(() => {
    return activeApi?.state.activeBridge;
  }, [activeApi?.state.activeBridge]);

  // Set default poolId and destTypedChainId on first render
  useEffect(
    () => {
      if (loading || isConnecting || !initialized) {
        return;
      }

      if (typeof srcTypedChainId === 'number' && typeof poolId === 'number') {
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

            if (typeof srcTypedChainId !== 'number') {
              params.set(SOURCE_CHAIN_KEY, typedChainId);
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

          if (typeof srcTypedChainId !== 'number') {
            next.set(SOURCE_CHAIN_KEY, `${typedChainId}`);
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

      if (typeof srcTypedChainId !== 'number' && defaultTypedId) {
        nextParams.set(SOURCE_CHAIN_KEY, defaultTypedId);
      }

      setSearchParams(nextParams);
    },
    // prettier-ignore
    [activeBridge, activeChain, apiConfig.anchors, balances, initialized, isConnecting, loading, poolId, setSearchParams, srcTypedChainId]
  );

  // If no active relayer, reset refund states
  useEffect(
    () => {
      if (!activeRelayer && (hasRefund || refundRecipient)) {
        setHasRefund('');
        setRefundRecipient('');
      }
    },
    // prettier-ignore
    [activeRelayer, hasRefund, refundRecipient, setHasRefund, setRefundRecipient]
  );

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

  const {
    gasFeeInfo,
    isLoading: isFeeLoading,
    totalFeeToken,
    totalFeeWei,
    resetMaxFeeInfo,
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
    if (!poolId || !srcTypedChainId) {
      return;
    }

    const balance = balances[poolId]?.[srcTypedChainId];
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
  }, [amount, balances, poolId, srcTypedChainId]);

  const { transferConfirmComponent, ...buttonProps } = useTransferButtonProps({
    balances,
    receivingAmount,
    isFeeLoading,
    totalFeeWei,
    feeToken: totalFeeToken,
    activeRelayer,
    resetFeeInfo: resetMaxFeeInfo,
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
            typedChainId={srcTypedChainId}
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
              <TransactionInputCard.ChainSelector
                onClick={() => handleChainClick()}
              />
              <TransactionInputCard.MaxAmountButton />
            </TransactionInputCard.Header>

            <TransactionInputCard.Body
              tokenSelectorProps={{
                placeHolder: 'Select pool',
                onClick: () => handleTokenClick(),
              }}
            />

            <TransactionInputCard.Footer />
          </TransactionInputCard.Root>

          <ArrowRight size="lg" className="mx-auto rotate-90" />

          <TransactionInputCard.Root
            typedChainId={destTypedChainId}
            tokenSymbol={fungibleCfg?.symbol}
            amount={amount}
            onAmountChange={setAmount}
            isFixedAmount={!isCustom}
            onIsFixedAmountChange={() =>
              setIsCustom((prev) => (prev.length > 0 ? '' : '1'))
            }
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
              show={!!hasRefund}
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
                        tokenSymbol: srcChainCfg?.nativeCurrency.symbol,
                      } satisfies FeeItem)
                    : undefined,
                ].filter((item) => Boolean(item)) as Array<FeeItem>
              }
            />

            <TxInfoContainer
              remaining={remainingBalance}
              remainingToken={fungibleCfg?.symbol}
              receivingAmount={receivingAmount}
              receivingToken={fungibleCfg?.symbol}
            />
          </div>

          <Button loadingText="Connecting..." {...buttonProps} isFullWidth />
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
