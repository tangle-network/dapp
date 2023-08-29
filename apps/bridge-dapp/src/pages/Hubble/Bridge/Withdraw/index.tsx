import { Transition } from '@headlessui/react';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import {
  AccountCircleLineIcon,
  ArrowRight,
  ClipboardLineIcon,
  FileCopyLine,
  GasStationFill,
  SettingsFillIcon,
  TokenIcon,
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
  Typography,
  useCopyable,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import cx from 'classnames';
import { useCallback, useEffect, useMemo } from 'react';
import { Outlet, useLocation, useSearchParams } from 'react-router-dom';
import {
  BRIDGE_TABS,
  DEST_CHAIN_KEY,
  POOL_KEY,
  SELECT_DESTINATION_CHAIN_PATH,
  SELECT_RELAYER_PATH,
  SELECT_SHIELDED_POOL_PATH,
  SELECT_TOKEN_PATH,
  TOKEN_KEY,
} from '../../../../constants';
import BridgeTabsContainer from '../../../../containers/BridgeTabsContainer';
import useNavigateWithPersistParams from '../../../../hooks/useNavigateWithPersistParams';
import useInputs from './private/useInputs';
import useRelayerWithRoute from './private/useRelayerWithRoute';

const TOKEN_NAME = 'Matic';
const CHAIN_NAME = 'Polygon Mumbai';

const Withdraw = () => {
  const { pathname } = useLocation();

  const navigate = useNavigateWithPersistParams();

  const [searchParams, setSearchParams] = useSearchParams();

  const balances = useBalancesFromNotes();

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
    refundAmount,
    setAmount,
    setHasRefund,
    setIsCustom,
    setRecipient,
    setRefundAmount,
  } = useInputs();

  const { relayerInstance } = useRelayerWithRoute();

  const [destTypedChainId, poolId, tokenId] = useMemo(() => {
    const destTypedId = parseInt(searchParams.get(DEST_CHAIN_KEY) ?? '');

    const poolId = parseInt(searchParams.get(POOL_KEY) ?? '');
    const tokenId = parseInt(searchParams.get(TOKEN_KEY) ?? '');

    return [
      Number.isNaN(destTypedId) ? undefined : destTypedId,
      Number.isNaN(poolId) ? undefined : poolId,
      Number.isNaN(tokenId) ? undefined : tokenId,
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

    return fungibleCfg && balances[fungibleCfg.id]?.[destTypedChainId];
  }, [balances, destTypedChainId, fungibleCfg]);

  const activeBridge = useMemo(() => {
    return activeApi?.state.activeBridge;
  }, [activeApi?.state.activeBridge]);

  // Set default poolId and destTypedChainId on first render
  useEffect(() => {
    if (loading || isConnecting) {
      return;
    }

    if (typeof destTypedChainId === 'number' && typeof poolId === 'number') {
      return
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
    const [defaultPool, anchors] = Object.entries(apiConfig.anchors)[0]
    const [defaultTypedId] = Object.entries(anchors)[0]

    const nextParams = new URLSearchParams();
    if (typeof poolId !== 'number' && defaultPool) {
      nextParams.set(POOL_KEY, defaultPool);
    }

    if (typeof destTypedChainId !== 'number' && defaultTypedId) {
      nextParams.set(DEST_CHAIN_KEY, defaultTypedId);
    }

    setSearchParams(nextParams);
  }, [activeBridge, activeChain, apiConfig.anchors, balances, destTypedChainId, isConnecting, loading, poolId, setSearchParams]); // prettier-ignore

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

  const lastPath = useMemo(() => pathname.split('/').pop(), [pathname]);
  if (lastPath && !BRIDGE_TABS.find((tab) => lastPath === tab)) {
    return <Outlet />;
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
            />

            <TransactionInputCard.Footer />
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
                Relayer
              </TransactionInputCard.Button>
            </TransactionInputCard.Header>

            <TransactionInputCard.Body
              tokenSelectorProps={{
                onClick: () => handleTokenClick(),
              }}
            />
          </TransactionInputCard.Root>

          <div className="flex gap-2">
            <div
              className={cx(
                'transition-[flex-grow] ease-in-out duration-200 space-y-2',
                {
                  'grow-0': hasRefund,
                  grow: !hasRefund,
                }
              )}
            >
              <TitleWithInfo
                title="Recipient Shielded Account"
                info="Recipient Shielded Account"
              />

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

            <Transition
              className="space-y-2"
              show={!!hasRefund}
              enter="transition-opacity duration-200"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <TitleWithInfo
                title="Refund Amount"
                info="The native token will be refunded to the recipient on the destination chain."
              />

              <TextField.Root className="max-w-none">
                <TextField.Input
                  placeholder="0.0"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                />

                {activeChain && (
                  <TextField.Slot>
                    <div className="flex items-center gap-2">
                      <TokenIcon
                        size="lg"
                        name={activeChain.nativeCurrency.symbol}
                      />

                      <Typography
                        variant="h5"
                        fw="bold"
                        component="span"
                        className="block"
                      >
                        {activeChain.nativeCurrency.symbol}
                      </Typography>
                    </div>
                  </TextField.Slot>
                )}
              </TextField.Root>
            </Transition>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-4 grow">
          <div className="space-y-4">
            <ToggleCard
              title="Enable refund"
              info="Refund"
              Icon={<GasStationFill size="lg" />}
              description={`Get ${TOKEN_NAME} on transactions on ${CHAIN_NAME}`}
              className="max-w-none"
              switcherProps={{
                checked: !!hasRefund,
                disabled: !relayerInstance,
                onCheckedChange: () =>
                  setHasRefund((prev) => (prev.length > 0 ? '' : '1')),
              }}
            />

            <FeeDetails
              items={[
                {
                  name: 'Gas',
                  Icon: <GasStationFill />,
                },
              ]}
            />
          </div>

          <Button isFullWidth>Transfer</Button>
        </div>
      </div>
    </BridgeTabsContainer>
  );
};

export default Withdraw;
