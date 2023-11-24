import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { ZERO_BIG_INT, chainsPopulated } from '@webb-tools/dapp-config';
import { CurrencyConfig } from '@webb-tools/dapp-config/currencies/currency-config.interface';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types';
import numberToString from '@webb-tools/webb-ui-components/utils/numberToString';
import { ComponentProps, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NumberParam, StringParam, useQueryParams } from 'use-query-params';
import { formatEther, parseEther } from 'viem';
import {
  AMOUNT_KEY,
  BRIDGE_PATH,
  DEPOSIT_PATH,
  DEST_CHAIN_KEY,
  POOL_KEY,
  SOURCE_CHAIN_KEY,
  TOKEN_KEY,
} from '../../../../../constants';
import DepositConfirmContainer from '../../../../../containers/DepositConfirmContainer/DepositConfirmContainer';
import useConnectButtonProps from '../../../../../hooks/useConnectButtonProps';
import handleTxError from '../../../../../utils/handleTxError';

function useDepositButtonProps({
  balance,
  fungible,
}: {
  balance?: number;
  fungible?: CurrencyConfig;
}) {
  const { activeApi, apiConfig, noteManager, loading, isConnecting } =
    useWebContext();

  const navigate = useNavigate();

  const [generatingNote, setGeneratingNote] = useState(false);

  const [depositConfirmComponent, setDepositConfirmComponent] =
    useState<React.ReactElement<
      ComponentProps<typeof DepositConfirmContainer>,
      typeof DepositConfirmContainer
    > | null>(null);

  const [query] = useQueryParams({
    [AMOUNT_KEY]: StringParam,
    [POOL_KEY]: NumberParam,
    [TOKEN_KEY]: NumberParam,
    [SOURCE_CHAIN_KEY]: NumberParam,
    [DEST_CHAIN_KEY]: NumberParam,
  });

  const {
    [AMOUNT_KEY]: amount,
    [POOL_KEY]: poolId,
    [TOKEN_KEY]: tokenId,
    [SOURCE_CHAIN_KEY]: srcTypedId,
    [DEST_CHAIN_KEY]: destTypedId,
  } = query;

  const { content: connectBtnCnt, handleConnect } =
    useConnectButtonProps(srcTypedId);

  const validAmount = useMemo(() => {
    if (typeof amount !== 'string' || amount.length === 0) {
      return false;
    }

    const amountBI = BigInt(amount); // amount from search params is parsed already

    // If balance is not a number, but amount is entered and > 0,
    // it means user not connected to wallet but entered amount
    // so we allow it
    if (typeof balance !== 'number' && amountBI > 0) {
      return true;
    }

    if (!balance || amountBI <= 0) {
      return false;
    }

    const parsedBalance = parseEther(numberToString(balance));

    return amountBI !== ZERO_BIG_INT && amountBI <= parsedBalance;
  }, [amount, balance]);

  const inputCnt = useMemo(() => {
    if (typeof tokenId !== 'number') {
      return 'Select token';
    }

    if (typeof destTypedId !== 'number') {
      return 'Select destination chain';
    }

    if (typeof amount !== 'string' || amount.length === 0) {
      return 'Enter amount';
    }

    if (typeof poolId !== 'number') {
      return 'Select pool';
    }

    if (typeof srcTypedId !== 'number') {
      return 'Select source chain';
    }

    return undefined;
  }, [amount, destTypedId, poolId, srcTypedId, tokenId]);

  const amountCnt = useMemo(() => {
    if (typeof amount !== 'string' || BigInt(amount) === ZERO_BIG_INT) {
      return 'Enter amount';
    }

    if (!validAmount) {
      return 'Insufficient balance';
    }
  }, [amount, validAmount]);

  const children = useMemo(() => {
    if (connectBtnCnt) {
      return connectBtnCnt;
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
  }, [amountCnt, connectBtnCnt, inputCnt, poolId, tokenId]);

  const isDisabled = useMemo(
    () => {
      if (connectBtnCnt) {
        return false;
      }

      const allInputsFilled =
        !!amount && !!tokenId && !!poolId && !!srcTypedId && !!destTypedId;

      if (!allInputsFilled || !validAmount) {
        return true;
      }

      return false;
    },
    // prettier-ignore
    [amount, connectBtnCnt, destTypedId, poolId, srcTypedId, tokenId, validAmount]
  );

  const isLoading = useMemo(() => {
    return loading || isConnecting || generatingNote;
  }, [generatingNote, isConnecting, loading]);

  const loadingText = useMemo(() => {
    if (generatingNote) {
      return 'Generating note...';
    }

    return 'Connecting...';
  }, [generatingNote]);

  const handleBtnClick = useCallback(
    async () => {
      let actualApi = activeApi;

      try {
        if (connectBtnCnt && typeof srcTypedId === 'number') {
          const nextApi = await handleConnect(srcTypedId);
          if (!nextApi?.noteManager) {
            return;
          }

          actualApi = nextApi;
        }

        if (!noteManager || !actualApi) {
          throw WebbError.from(WebbErrorCodes.ApiNotReady);
        }

        if (!fungible) {
          throw WebbError.from(WebbErrorCodes.NoFungibleTokenAvailable);
        }

        const srcTypedIdNum = Number(srcTypedId);
        const destTypedIdNum = Number(destTypedId);
        const poolIdNum = Number(poolId);

        if (
          Number.isNaN(srcTypedIdNum) ||
          Number.isNaN(destTypedIdNum) ||
          Number.isNaN(poolIdNum)
        ) {
          throw WebbError.from(WebbErrorCodes.UnsupportedChain);
        }

        const srcChain = chainsPopulated[srcTypedIdNum];
        const destChain = chainsPopulated[destTypedIdNum];

        if (!srcChain || !destChain) {
          throw WebbError.from(WebbErrorCodes.UnsupportedChain);
        }

        if (typeof amount !== 'string' || amount.length === 0) {
          throw WebbError.from(WebbErrorCodes.InvalidAmount);
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
          throw WebbError.from(WebbErrorCodes.AnchorIdNotFound);
        }

        const amountBig = BigInt(amount);
        const transactNote = await noteManager.generateNote(
          actualApi.backend,
          srcTypedIdNum,
          srcAnchorId,
          destTypedIdNum,
          destAnchorId,
          fungible.symbol,
          fungible.decimals,
          amountBig
        );

        setGeneratingNote(false);

        setDepositConfirmComponent(
          <DepositConfirmContainer
            fungibleTokenId={poolIdNum}
            wrappableTokenId={
              typeof tokenId === 'number' && tokenId !== poolIdNum
                ? tokenId
                : undefined
            }
            amount={parseFloat(formatEther(amountBig))}
            sourceTypedChainId={srcTypedId ?? undefined}
            destTypedChainId={destTypedId ?? undefined}
            note={transactNote}
            onResetState={() => {
              setDepositConfirmComponent(null);
              navigate(`/${BRIDGE_PATH}/${DEPOSIT_PATH}`);
            }}
            onClose={() => {
              setDepositConfirmComponent(null);
            }}
          />
        );
      } catch (error) {
        handleTxError(error, 'Deposit');
      }
    },
    // prettier-ignore
    [activeApi, amount, apiConfig, connectBtnCnt, destTypedId, fungible, handleConnect, navigate, noteManager, poolId, srcTypedId, tokenId]
  );

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
