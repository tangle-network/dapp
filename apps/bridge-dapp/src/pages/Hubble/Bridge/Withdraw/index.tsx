import { Transition } from '@headlessui/react';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import chainsPopulated from '@webb-tools/dapp-config/chains/chainsPopulated';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import {
  AccountCircleLineIcon,
  ArrowRight,
  ClipboardLineIcon,
  FileCopyLine,
  GasStationFill,
  SettingsFillIcon,
  ShieldKeyholeFillIcon,
  TokenIcon,
  WalletFillIcon,
} from '@webb-tools/icons';
import { NoteManager } from '@webb-tools/note-manager/note-manager';
import { useNoteAccount, useVAnchor } from '@webb-tools/react-hooks';
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
import { FeeItem } from '@webb-tools/webb-ui-components/components/FeeDetails/types';
import cx from 'classnames';
import {
  ComponentProps,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Outlet, useLocation, useSearchParams } from 'react-router-dom';
import { formatEther, formatUnits, parseEther, parseUnits } from 'viem';
import TxInfoItem from '../../../../components/TxInfoItem';
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
import { useConnectWallet } from '../../../../hooks/useConnectWallet';
import useNavigateWithPersistParams from '../../../../hooks/useNavigateWithPersistParams';
import useFeeCalculation from './private/useFeeCalculation';
import useInputs from './private/useInputs';
import useRelayerWithRoute from './private/useRelayerWithRoute';
import { ZERO_BIG_INT } from '@webb-tools/dapp-config/constants';
import utxoFromVAnchorNote from '@webb-tools/abstract-api-provider/utils/utxoFromVAnchorNote';
import SlideAnimation from '../../../../components/SlideAnimation';
import { WithdrawConfirmContainer } from '../../../../containers/WithdrawContainer/WithdrawConfirmContainer';
import { Currency } from '@webb-tools/abstract-api-provider/currency/currency';

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
    activeWallet,
    switchChain,
    noteManager,
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

  const { activeRelayer } = useRelayerWithRoute();

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

  const destChainCfg = useMemo(() => {
    if (typeof destTypedChainId !== 'number') {
      return;
    }

    return apiConfig.chains[destTypedChainId];
  }, [apiConfig.chains, destTypedChainId]);

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

  // If no active relayer, reset refund states
  useEffect(() => {
    if (!activeRelayer && (hasRefund || refundAmount)) {
      setHasRefund('');
      setRefundAmount('');
    }
  }, [activeRelayer, hasRefund, refundAmount, setHasRefund, setRefundAmount]);

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
    isLoading: isLoadingFee,
    refundAmountError,
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
      return;
    }

    const remain = parseEther(amount) - totalFeeWei;
    return +formatEther(remain);
  }, [activeRelayer, amount, totalFeeWei]);

  const remainingBalance = useMemo(() => {
    if (!poolId || !destTypedChainId) {
      return;
    }

    const balance = balances[poolId]?.[destTypedChainId];
    if (typeof balance !== 'number') {
      return;
    }

    if (!amount) {
      return balance;
    }

    const remain = balance - parseFloat(amount);
    if (remain < 0) {
      return;
    }

    return remain;
  }, [amount, balances, destTypedChainId, poolId]);

  const { hasNoteAccount, setOpenNoteAccountModal } = useNoteAccount();

  const { isWalletConnected, toggleModal } = useConnectWallet();

  const isValidAmount = useMemo(() => {
    if (!fungibleCfg) {
      return false;
    }

    if (typeof destTypedChainId !== 'number') {
      return false;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
      return false;
    }

    const balance = balances[fungibleCfg.id]?.[destTypedChainId];
    if (typeof balance !== 'number') {
      return false;
    }

    if (typeof receivingAmount !== 'number') {
      return false;
    }

    return parsedAmount <= balance && receivingAmount >= 0;
  }, [amount, balances, destTypedChainId, fungibleCfg, receivingAmount]);

  const connCnt = useMemo(() => {
    if (!activeApi) {
      return 'Connect Wallet';
    }

    if (!hasNoteAccount) {
      return 'Create Note Account';
    }

    const activeId = activeApi.typedChainidSubject.getValue();
    if (activeId !== destTypedChainId) {
      return 'Switch Chain';
    }

    return undefined;
  }, [activeApi, destTypedChainId, hasNoteAccount]);

  const inputCnt = useMemo(() => {
    if (!destTypedChainId) {
      return 'Select chain';
    }

    if (!fungibleCfg) {
      return 'Select pool';
    }

    if (!wrappableCfg) {
      return 'Select withdraw token';
    }

    if (!recipient) {
      return 'Enter recipient';
    }

    if (hasRefund && !refundAmount) {
      return 'Enter refund amount';
    }

    if (!isValidAmount) {
      return 'Insufficient balance';
    }
  }, [destTypedChainId, fungibleCfg, hasRefund, isValidAmount, recipient, refundAmount, wrappableCfg]); // prettier-ignore

  const btnText = useMemo(() => {
    if (connCnt) {
      return connCnt;
    }

    if (inputCnt) {
      return inputCnt;
    }

    if (fungibleCfg && fungibleCfg.id !== wrappableCfg?.id) {
      return 'Withdraw and Unwrap';
    }

    return 'Withdraw';
  }, [connCnt, fungibleCfg, inputCnt, wrappableCfg?.id]);

  const isDisabled = useMemo(() => {
    if (!isWalletConnected || !hasNoteAccount) {
      return false;
    }

    const allInputsFilled =
      !!amount &&
      !!fungibleCfg &&
      !!wrappableCfg &&
      !!recipient &&
      (hasRefund ? !!refundAmount : true);

    return !allInputsFilled || !isValidAmount;
  }, [amount, fungibleCfg, hasNoteAccount, hasRefund, isValidAmount, isWalletConnected, recipient, refundAmount, wrappableCfg]); // prettier-ignore

  const isLoading = useMemo(() => {
    return loading || isConnecting;
  }, [isConnecting, loading]);

  const { api: vAnchorApi } = useVAnchor();

  const [withdrawConfirmComponent, setWithdrawConfirmComponent] =
    useState<React.ReactElement<
      ComponentProps<typeof WithdrawConfirmContainer>,
      typeof WithdrawConfirmContainer
    > | null>(null);

  const handleSwitchChain = useCallback(async () => {
    const nextChain = chainsPopulated[Number(destTypedChainId)];
    if (!nextChain) {
      console.error(WebbError.getErrorMessage(WebbErrorCodes.UnsupportedChain));
      return;
    }

    const isNextChainActive = activeChain?.id === nextChain.id && activeChain?.chainType === nextChain.chainType;

    if (!isWalletConnected || !isNextChainActive) {
      if (activeWallet && nextChain.wallets.includes(activeWallet.id)) {
        await switchChain(nextChain, activeWallet);
      } else {
        toggleModal(true, nextChain);
      }
      return;
    }

    if (!hasNoteAccount) {
      setOpenNoteAccountModal(true);
    }
  }, [activeChain?.chainType, activeChain?.id, activeWallet, destTypedChainId, hasNoteAccount, isWalletConnected, setOpenNoteAccountModal, switchChain, toggleModal]); // prettier-ignore

  const handleWithdrawBtnClick = useCallback(async () => {
    if (connCnt) {
      return await handleSwitchChain();
    }

    // For type assertion
    const _validAmount =
      isValidAmount && !!amount && typeof receivingAmount === 'number';

    const allInputsFilled =
      !!destChainCfg && !!fungibleCfg && !!destTypedChainId && _validAmount;

    const doesApiReady = !!activeApi?.state.activeBridge && !!vAnchorApi && !!noteManager;

    if (!allInputsFilled || !doesApiReady) {
      console.error(WebbError.getErrorMessage(WebbErrorCodes.ApiNotReady));
      return;
    }

    if (activeApi.state.activeBridge?.currency.id !== fungibleCfg.id) {
      console.error(WebbError.getErrorMessage(WebbErrorCodes.InvalidArguments));
      return;
    }

    const anchorId = activeApi.state.activeBridge.targets[destTypedChainId]
    if (!anchorId) {
      console.error(WebbError.getErrorMessage(WebbErrorCodes.AnchorIdNotFound));
      return;
    }

    const resourceId = await vAnchorApi.getResourceId(
      anchorId,
      destChainCfg.id,
      destChainCfg.chainType
    );

    const avaiNotes = (
      noteManager.getNotesOfChain(resourceId.toString()) ?? []
    ).filter(
      (note) =>
        note.note.tokenSymbol === fungibleCfg.symbol &&
        !!fungibleCfg.addresses.get(+note.note.targetChainId)
    );

    const fungibleDecimals = fungibleCfg.decimals;
    const amountFloat = parseFloat(amount);
    const amountBig = parseUnits(amount, fungibleDecimals);

    // Get the notes that will be spent for this withdraw
    const inputNotes = NoteManager.getNotesFifo(avaiNotes, amountBig);
    if (!inputNotes) {
      console.error(
        WebbError.getErrorMessage(WebbErrorCodes.NoteParsingFailure)
      );
      return;
    }

    // Sum up the amount of the input notes to calculate the change amount
    const totalAmountInput = inputNotes.reduce(
      (acc, note) => acc + BigInt(note.note.amount),
      ZERO_BIG_INT
    );

    const changeAmount = totalAmountInput - amountBig;
    if (changeAmount < 0) {
      console.error(WebbError.getErrorMessage(WebbErrorCodes.InvalidArguments));
      return;
    }

    const keypair = noteManager.getKeypair();
    if (!keypair.privkey) {
      console.error(WebbError.getErrorMessage(WebbErrorCodes.KeyPairNotFound));
      return;
    }

    const changeNote =
      changeAmount > 0
        ? await noteManager.generateNote(
            activeApi.backend,
            destTypedChainId,
            anchorId,
            destTypedChainId,
            anchorId,
            fungibleCfg.symbol,
            fungibleDecimals,
            changeAmount
          )
        : undefined;

    // Generate change utxo (or dummy utxo if the changeAmount is `0`)
    const changeUtxo = changeNote
      ? await utxoFromVAnchorNote(
          changeNote.note,
          changeNote.note.index ? +changeNote.note.index : 0
        )
      : await activeApi.generateUtxo({
          curve: noteManager.defaultNoteGenInput.curve,
          backend: activeApi.backend,
          amount: changeAmount.toString(),
          chainId: `${destTypedChainId}`,
          keypair,
          originChainId: `${destTypedChainId}`,
          index: activeApi.state.defaultUtxoIndex.toString(),
        });

    setWithdrawConfirmComponent(
      <WithdrawConfirmContainer
        changeUtxo={changeUtxo}
        changeNote={changeNote}
        changeAmount={+formatUnits(changeAmount, fungibleDecimals)}
        sourceTypedChainId={destTypedChainId}
        targetTypedChainId={destTypedChainId}
        availableNotes={inputNotes}
        amount={amountFloat}
        fee={typeof totalFeeWei === 'bigint' ? totalFeeWei : ZERO_BIG_INT}
        amountAfterFee={parseEther(`${receivingAmount}`)}
        isRefund={!hasRefund}
        fungibleCurrency={{
          value: new Currency(fungibleCfg),
        }}
        unwrapCurrency={
          wrappableCfg && wrappableCfg.id !== fungibleCfg.id
            ? { value: new Currency(wrappableCfg) }
            : undefined
        }
        refundAmount={parseEther(`${refundAmount}`)}
        refundToken={destChainCfg.nativeCurrency.symbol}
        recipient={recipient}
        onResetState={() => {
          setSearchParams({});
          setWithdrawConfirmComponent(null)
        }}
        onClose={() => {
          setWithdrawConfirmComponent(null)
        }}
      />
    );
  }, [activeApi, amount, connCnt, destChainCfg, destTypedChainId, fungibleCfg, handleSwitchChain, hasRefund, isValidAmount, noteManager, receivingAmount, recipient, refundAmount, setSearchParams, totalFeeWei, vAnchorApi, wrappableCfg]); // prettier-ignore

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

              <TextField.Root className="max-w-none" error={refundAmountError}>
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
              isTotalLoading={isLoadingFee}
              totalFee={
                typeof totalFeeWei === 'bigint'
                  ? +formatEther(totalFeeWei)
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
                        isLoading: isLoadingFee,
                        Icon: <GasStationFill />,
                        value: +formatEther(gasFeeInfo),
                        tokenSymbol: destChainCfg?.nativeCurrency.symbol,
                      } satisfies FeeItem)
                    : undefined,
                ].filter((item) => Boolean(item)) as Array<FeeItem>
              }
            />

            <TxInfoContainer
              hasRefund={!!hasRefund}
              refundAmount={refundAmount}
              refundToken={activeChain?.nativeCurrency.symbol}
              remaining={remainingBalance}
              remainingToken={fungibleCfg?.symbol}
              receivingAmount={receivingAmount}
              receivingToken={wrappableCfg?.symbol}
            />
          </div>

          <Button
            isLoading={isLoading}
            loadingText="Connecting..."
            isFullWidth
            isDisabled={isDisabled}
            onClick={handleWithdrawBtnClick}
          >
            {btnText}
          </Button>
        </div>
      </div>
    </BridgeTabsContainer>
  );
};

export default Withdraw;

const TxInfoContainer = ({
  hasRefund,
  receivingAmount,
  receivingToken,
  refundAmount,
  refundToken,
  remaining,
  remainingToken,
}: {
  hasRefund?: boolean;
  receivingAmount?: number;
  receivingToken?: string;
  refundAmount?: string;
  refundToken?: string;
  remaining?: number;
  remainingToken?: string;
}) => {
  return (
    <div className="space-y-2">
      <TxInfoItem
        leftContent={{
          title: 'Receiving',
        }}
        rightIcon={<WalletFillIcon />}
        rightText={
          typeof receivingAmount === 'number'
            ? receivingAmount < 0
              ? '< 0'
              : `${receivingAmount.toString().slice(0, 10)} ${
                  receivingToken ?? ''
                }`.trim()
            : '--'
        }
      />
      {refundAmount && hasRefund && (
        <TxInfoItem
          leftContent={{
            title: 'Refund',
          }}
          rightIcon={<WalletFillIcon />}
          rightText={`${refundAmount} ${refundToken ?? ''}`.trim()}
        />
      )}
      <TxInfoItem
        leftContent={{
          title: 'Remaining Balance',
        }}
        rightIcon={<ShieldKeyholeFillIcon />}
        rightText={
          typeof remaining === 'number'
            ? `${remaining.toString().slice(0, 10)} ${
                remainingToken ?? ''
              }`.trim()
            : '--'
        }
      />
    </div>
  );
};
