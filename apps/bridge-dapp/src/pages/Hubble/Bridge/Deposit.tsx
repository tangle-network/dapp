import { useWebContext } from '@webb-tools/api-provider-environment';
import chainsPopulated from '@webb-tools/dapp-config/chains/chainsPopulated';
import { ZERO_BIG_INT } from '@webb-tools/dapp-config/constants';
import { CurrencyConfig } from '@webb-tools/dapp-config/currencies/currency-config.interface';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types';
import { ArrowRight } from '@webb-tools/icons';
import { useCurrenciesBalances, useNoteAccount } from '@webb-tools/react-hooks';
import { calculateTypedChainId } from '@webb-tools/sdk-core/typed-chain-id';
import {
  Button,
  FeeDetails,
  TransactionInputCard,
  numberToString,
} from '@webb-tools/webb-ui-components';
import {
  ComponentProps,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { formatEther, parseEther } from 'viem';
import {
  AMOUNT_KEY,
  BRIDGE_TABS,
  DEST_CHAIN_KEY,
  POOL_KEY,
  SELECT_DESTINATION_CHAIN_PATH,
  SELECT_SHIELDED_POOL_PATH,
  SELECT_SOURCE_CHAIN_PATH,
  SELECT_TOKEN_PATH,
  SOURCE_CHAIN_KEY,
  TOKEN_KEY,
} from '../../../constants';
import BridgeTabsContainer from '../../../containers/BridgeTabsContainer';
import { DepositConfirmContainer } from '../../../containers/DepositContainer/DepositConfirmContainer';
import { useConnectWallet } from '../../../hooks';
import useCurrenciesFromRoute from '../../../hooks/useCurrenciesFromRoute';

const Deposit = () => {
  const navigate = useNavigate();

  const { pathname } = useLocation();

  const {
    allCurrencies,
    amount,
    destTypedChainId,
    fungibleCfg,
    onAmountChange,
    searchParams,
    srcTypedChainId,
    wrappableCfg,
  } = useWatchSearchParams();

  const balances = useCurrenciesBalances(allCurrencies, srcTypedChainId);

  const { depositConfirmComponent, ...depositBtnProps } = useDepositButtonProps(
    {
      balance: wrappableCfg ? balances[wrappableCfg.id] : undefined,
      fungible: fungibleCfg,
    }
  );

  const amountProps = useMemo(
    () => ({
      amount,
      onAmountChange,
    }),
    [amount, onAmountChange]
  );

  const lastPath = useMemo(() => pathname.split('/').pop(), [pathname]);
  if (lastPath && !BRIDGE_TABS.includes(lastPath)) {
    return <Outlet />;
  }

  if (depositConfirmComponent !== null) {
    return depositConfirmComponent;
  }

  return (
    <BridgeTabsContainer>
      <div className="flex flex-col space-y-6 grow">
        <div className="space-y-2">
          <TransactionInputCard.Root
            typedChainId={srcTypedChainId}
            tokenSymbol={wrappableCfg?.symbol}
            maxAmount={wrappableCfg ? balances[wrappableCfg.id] : undefined}
            {...amountProps}
          >
            <TransactionInputCard.Header>
              <TransactionInputCard.ChainSelector
                onClick={() =>
                  navigate({
                    pathname: SELECT_SOURCE_CHAIN_PATH,
                    search: searchParams.toString(),
                  })
                }
              />
              <TransactionInputCard.MaxAmountButton />
            </TransactionInputCard.Header>

            <TransactionInputCard.Body
              tokenSelectorProps={{
                onClick: () =>
                  navigate({
                    pathname: SELECT_TOKEN_PATH,
                    search: searchParams.toString(),
                  }),
              }}
            />
          </TransactionInputCard.Root>

          <ArrowRight size="lg" className="mx-auto rotate-90" />

          <TransactionInputCard.Root
            typedChainId={destTypedChainId}
            tokenSymbol={fungibleCfg?.symbol}
            maxAmount={fungibleCfg ? balances[fungibleCfg.id] : undefined}
            {...amountProps}
          >
            <TransactionInputCard.Header>
              <TransactionInputCard.ChainSelector
                onClick={() =>
                  navigate({
                    pathname: SELECT_DESTINATION_CHAIN_PATH,
                    search: searchParams.toString(),
                  })
                }
              />
              <TransactionInputCard.MaxAmountButton />
            </TransactionInputCard.Header>

            <TransactionInputCard.Body
              tokenSelectorProps={{
                placeHolder: 'Select pool',
                onClick: () =>
                  navigate({
                    pathname: SELECT_SHIELDED_POOL_PATH,
                    search: searchParams.toString(),
                  }),
              }}
            />
          </TransactionInputCard.Root>
        </div>

        <div className="flex flex-col justify-between grow">
          <FeeDetails />

          <Button isFullWidth {...depositBtnProps} />
        </div>
      </div>
    </BridgeTabsContainer>
  );
};

export default Deposit;

function useWatchSearchParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const { allCurrencies, fungibleCfg, wrappableCfg } = useCurrenciesFromRoute();

  const { activeChain, apiConfig, activeApi } = useWebContext();

  const [srcTypedChainId, destTypedChainId, tokenId, amountStr] =
    useMemo(() => {
      const sourceStr = searchParams.get(SOURCE_CHAIN_KEY) ?? '';
      const destStr = searchParams.get(DEST_CHAIN_KEY) ?? '';

      const tokenStr = searchParams.get(TOKEN_KEY) ?? '';

      const amountStr = searchParams.get('amount') ?? '';

      return [
        !Number.isNaN(parseInt(sourceStr)) ? parseInt(sourceStr) : undefined,
        !Number.isNaN(parseInt(destStr)) ? parseInt(destStr) : undefined,
        !Number.isNaN(parseInt(tokenStr)) ? parseInt(tokenStr) : undefined,
        amountStr.length ? formatEther(BigInt(amountStr)) : '',
      ];
    }, [searchParams]);

  const [amount, setAmount] = useState(amountStr);

  useEffect(() => {
    setSearchParams((prev) => {
      if (prev.has(SOURCE_CHAIN_KEY) || !activeChain) {
        return prev;
      }

      const typedChainId = calculateTypedChainId(
        activeChain.chainType,
        activeChain.id
      );
      const nextParams = new URLSearchParams(prev);
      nextParams.set(SOURCE_CHAIN_KEY, `${typedChainId}`);
      return nextParams;
    });
  }, [activeChain, setSearchParams]);

  const activeBridge = useMemo(() => {
    return activeApi?.state.activeBridge;
  }, [activeApi]);

  // Find default pool id when source chain is changed
  const defaultPoolId = useMemo(() => {
    if (!srcTypedChainId) {
      return;
    }

    if (
      activeBridge &&
      Object.keys(activeBridge.targets).includes(`${srcTypedChainId}`)
    ) {
      return `${activeBridge.currency.id}`;
    }

    const anchor = Object.entries(apiConfig.anchors).find(
      ([, anchorsRecord]) => {
        return Object.keys(anchorsRecord).includes(`${srcTypedChainId}`);
      }
    );

    return anchor?.[0];
  }, [activeBridge, apiConfig.anchors, srcTypedChainId]);

  useEffect(() => {
    setSearchParams((prev) => {
      if (!defaultPoolId) {
        return prev;
      }

      const nextParams = new URLSearchParams(prev);
      nextParams.set(POOL_KEY, `${defaultPoolId}`);

      return nextParams;
    });
  }, [defaultPoolId, setSearchParams]);

  // Remove token if it is not supported
  useEffect(() => {
    if (typeof tokenId !== 'number') {
      return;
    }

    const currency = allCurrencies.find((c) => c.id === tokenId);
    // No currency means the token is not supported
    if (!currency) {
      setSearchParams((prev) => {
        const nextParams = new URLSearchParams(prev);
        nextParams.delete(TOKEN_KEY);
        return nextParams;
      });
    }
  }, [allCurrencies, setSearchParams, tokenId]);

  // Remove destination chain if it is not supported
  useEffect(() => {
    if (!destTypedChainId) {
      return;
    }

    if (!fungibleCfg) {
      setSearchParams((prev) => {
        const nextParams = new URLSearchParams(prev);
        nextParams.delete(DEST_CHAIN_KEY);
        return nextParams;
      });
      return;
    }

    const anchor = apiConfig.anchors[fungibleCfg.id];
    if (!Object.keys(anchor).includes(`${destTypedChainId}`)) {
      setSearchParams((prev) => {
        const nextParams = new URLSearchParams(prev);
        nextParams.delete(DEST_CHAIN_KEY);
        return nextParams;
      });
    }
  }, [apiConfig.anchors, destTypedChainId, fungibleCfg, setSearchParams]);

  // Update amount on search params with debounce
  useEffect(() => {
    function updateParams() {
      if (!amount) {
        return setSearchParams((prev) => {
          const nextParams = new URLSearchParams(prev);
          nextParams.delete(AMOUNT_KEY);
          return nextParams;
        });
      }

      setSearchParams((prev) => {
        const nextParams = new URLSearchParams(prev);
        nextParams.set(AMOUNT_KEY, `${parseEther(amount)}`);
        return nextParams;
      });
    }

    const timeout = setTimeout(updateParams, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, [amount, setSearchParams]);

  const handleAmountChange = useCallback((amount: string) => {
    const validationRegex = /^\d*\.?\d*$/;
    const isValid = validationRegex.test(amount);
    if (isValid) {
      setAmount(amount);
    }
  }, []);

  return {
    allCurrencies,
    amount,
    destTypedChainId,
    fungibleCfg,
    onAmountChange: handleAmountChange,
    searchParams,
    setSearchParams,
    srcTypedChainId,
    wrappableCfg,
  };
}

function useDepositButtonProps({
  balance,
  fungible,
}: {
  balance?: number;
  fungible?: CurrencyConfig;
}) {
  const { activeApi, activeWallet, switchChain, apiConfig, noteManager } =
    useWebContext();

  const { toggleModal } = useConnectWallet();

  const { hasNoteAccount, setOpenNoteAccountModal } = useNoteAccount();

  const [searchParams] = useSearchParams();

  const [generatingNote, setGeneratingNote] = useState(false);

  const [depositConfirmComponent, setDepositConfirmComponent] =
    useState<React.ReactElement<
      ComponentProps<typeof DepositConfirmContainer>,
      typeof DepositConfirmContainer
    > | null>(null);

  const [amount, tokenId, poolId, srcTypedId, destTypedId] = useMemo(() => {
    return [
      searchParams.get(AMOUNT_KEY) ?? '',
      searchParams.get(TOKEN_KEY) ?? '',
      searchParams.get(POOL_KEY) ?? '',
      searchParams.get(SOURCE_CHAIN_KEY) ?? '',
      searchParams.get(DEST_CHAIN_KEY) ?? '',
    ];
  }, [searchParams]);

  const validAmount = useMemo(() => {
    if (!balance || !amount) {
      return false;
    }

    const parsedBalance = parseEther(numberToString(balance));
    const parsedAmount = BigInt(amount); // amount from search params is parsed already

    return parsedAmount !== ZERO_BIG_INT && parsedAmount <= parsedBalance;
  }, [amount, balance]);

  const inputCnt = useMemo(() => {
    if (!amount || !tokenId || !poolId || !srcTypedId || !destTypedId) {
      return 'Enter inputs';
    }

    return undefined;
  }, [amount, destTypedId, poolId, srcTypedId, tokenId]);

  const conncnt = useMemo(() => {
    if (!activeApi) {
      return 'Connect Wallet';
    }

    if (!hasNoteAccount) {
      return 'Create Note Account';
    }

    const activeId = activeApi.typedChainidSubject.getValue();
    if (`${activeId}` !== srcTypedId) {
      return 'Switch Chain';
    }

    return undefined;
  }, [activeApi, hasNoteAccount, srcTypedId]);

  const amountCnt = useMemo(() => {
    if (typeof balance !== 'number') {
      return 'Loading balance...';
    }

    if (BigInt(amount) === ZERO_BIG_INT) {
      return 'Enter amount';
    }

    if (!validAmount) {
      return 'Insufficient balance';
    }
  }, [amount, balance, validAmount]);

  const children = useMemo(() => {
    if (inputCnt) {
      return inputCnt;
    }

    if (amountCnt) {
      return amountCnt;
    }

    if (conncnt) {
      return conncnt;
    }

    if (tokenId !== poolId) {
      return 'Wrap and Deposit';
    }

    return 'Deposit';
  }, [amountCnt, conncnt, inputCnt, poolId, tokenId]);

  const isDisabled = useMemo(() => {
    const allInputsFilled =
      !!amount && !!tokenId && !!poolId && !!srcTypedId && !!destTypedId;

    return !allInputsFilled || !validAmount;
  }, [amount, destTypedId, poolId, srcTypedId, tokenId, validAmount]);

  const handleSwitchChain = useCallback(() => {
    if (!hasNoteAccount) {
      return setOpenNoteAccountModal(true);
    }

    const nextChain = chainsPopulated[Number(srcTypedId)];
    if (!nextChain) {
      return;
    }

    if (activeWallet && nextChain.wallets.includes(activeWallet.id)) {
      return switchChain(nextChain, activeWallet);
    }

    return toggleModal(true, nextChain);
  }, [activeWallet, hasNoteAccount, setOpenNoteAccountModal, srcTypedId, switchChain, toggleModal]); // prettier-ignore

  const handleBtnClick = useCallback(async () => {
    if (conncnt) {
      handleSwitchChain();
      return;
    }

    if (!noteManager || !activeApi) {
      const err = WebbError.getErrorMessage(WebbErrorCodes.ApiNotReady);
      console.error(err)
      return;
    }

    if (!fungible) {
      const err = WebbError.getErrorMessage(WebbErrorCodes.NoFungibleTokenAvailable);
      console.error(err);
      return;
    }

    const srcTypedIdNum = Number(srcTypedId);
    const destTypedIdNum = Number(destTypedId);
    const poolIdNum = Number(poolId);

    if (Number.isNaN(srcTypedIdNum) || Number.isNaN(destTypedIdNum) || Number.isNaN(poolIdNum)) {
      const err = WebbError.getErrorMessage(WebbErrorCodes.UnsupportedChain);
      console.error(err);
      return;
    }

    const srcChain = chainsPopulated[srcTypedIdNum];
    const destChain = chainsPopulated[destTypedIdNum];

    if (!srcChain || !destChain) {
      const err = WebbError.getErrorMessage(WebbErrorCodes.UnsupportedChain);
      console.error(err);
      return;
    }

    setGeneratingNote(true);

    const srcAnchorId = apiConfig.getAnchorIdentifier(
      poolIdNum,
      srcTypedIdNum
    );

    const destAnchorId = apiConfig.getAnchorIdentifier(
      poolIdNum,
      destTypedIdNum
    );

    if (!srcAnchorId || !destAnchorId) {
      const err = WebbError.getErrorMessage(WebbErrorCodes.AnchorIdNotFound);
      console.error(err);
      return;
    }

    const amountBig = BigInt(amount);
    const transactNote = await noteManager.generateNote(
      activeApi.backend,
      srcTypedIdNum,
      srcAnchorId,
      destTypedIdNum,
      destAnchorId,
      fungible.symbol,
      fungible.decimals,
      amountBig
    )

    setGeneratingNote(false);

    setDepositConfirmComponent(
      <DepositConfirmContainer
        fungibleTokenId={poolIdNum}
        wrappableTokenId={tokenId ? Number(tokenId) : undefined}
        amount={+formatEther(amountBig)}
        sourceChain={{
          name: srcChain.name,
          type: srcChain.group
        }}
        destChain={{
          name: destChain.name,
          type: destChain.group
        }}
        note={transactNote}
        onResetState={() => setDepositConfirmComponent(null)}
      />
    )
  }, [activeApi, amount, apiConfig, conncnt, destTypedId, fungible, handleSwitchChain, noteManager, poolId, srcTypedId, tokenId]); // prettier-ignore

  return {
    children,
    isLoading: generatingNote,
    loadingText: 'Generating note...',
    onClick: handleBtnClick,
    isDisabled,
    depositConfirmComponent,
  };
}
