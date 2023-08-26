import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { ZERO_BIG_INT, chainsPopulated } from '@webb-tools/dapp-config';
import { CurrencyConfig } from '@webb-tools/dapp-config/currencies/currency-config.interface';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types';
import { useNoteAccount } from '@webb-tools/react-hooks/useNoteAccount';
import numberToString from '@webb-tools/webb-ui-components/utils/numberToString';
import { ComponentProps, useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { formatEther, parseEther } from 'viem';
import SlideAnimation from '../../../../../components/SlideAnimation';
import {
  AMOUNT_KEY,
  DEST_CHAIN_KEY,
  POOL_KEY,
  SOURCE_CHAIN_KEY,
  TOKEN_KEY,
} from '../../../../../constants';
import { DepositConfirmContainer } from '../../../../../containers/DepositContainer/DepositConfirmContainer';
import { useConnectWallet } from '../../../../../hooks/useConnectWallet';

function useDepositButtonProps({
  balance,
  fungible,
}: {
  balance?: number;
  fungible?: CurrencyConfig;
}) {
  const {
    activeApi,
    activeWallet,
    switchChain,
    apiConfig,
    noteManager,
    loading,
    isConnecting,
  } = useWebContext();

  const { toggleModal, isWalletConnected } = useConnectWallet();

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
    if (conncnt) {
      return conncnt;
    }

    if (inputCnt) {
      return inputCnt;
    }

    if (amountCnt) {
      return amountCnt;
    }

    if (tokenId !== poolId) {
      return 'Wrap and Deposit';
    }

    return 'Deposit';
  }, [amountCnt, conncnt, inputCnt, poolId, tokenId]);

  const isDisabled = useMemo(() => {
    if (!isWalletConnected || !hasNoteAccount) {
      return false;
    }

    const allInputsFilled =
      !!amount && !!tokenId && !!poolId && !!srcTypedId && !!destTypedId;

    return !allInputsFilled || !validAmount;
  }, [amount, destTypedId, hasNoteAccount, isWalletConnected, poolId, srcTypedId, tokenId, validAmount]); // prettier-ignore

  const isLoading = useMemo(() => {
    return loading || isConnecting || generatingNote;
  }, [generatingNote, isConnecting, loading]);

  const loadingText = useMemo(() => {
    if (generatingNote) {
      return 'Generating note...';
    }

    return 'Connecting...';
  }, [generatingNote]);

  const handleSwitchChain = useCallback(async () => {
    const nextChain = chainsPopulated[Number(srcTypedId)];
    if (!nextChain) {
      return;
    }

    if (!isWalletConnected) {
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
  }, [activeWallet, hasNoteAccount, isWalletConnected, setOpenNoteAccountModal, srcTypedId, switchChain, toggleModal]); // prettier-ignore

  const handleBtnClick = useCallback(async () => {
    if (conncnt) {
      return handleSwitchChain();
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
      <SlideAnimation>
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
      </SlideAnimation>
    )
  }, [activeApi, amount, apiConfig, conncnt, destTypedId, fungible, handleSwitchChain, noteManager, poolId, srcTypedId, tokenId]); // prettier-ignore

  return {
    children,
    isLoading,
    loadingText,
    onClick: handleBtnClick,
    isDisabled,
    depositConfirmComponent,
  };
}

export default useDepositButtonProps;
