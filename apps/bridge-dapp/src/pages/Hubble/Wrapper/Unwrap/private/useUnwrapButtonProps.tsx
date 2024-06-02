import { useCallback, useMemo, useState } from 'react';
import { NumberParam, StringParam, useQueryParams } from 'use-query-params';
import { parseEther } from 'viem';
import { useNavigate } from 'react-router';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { ZERO_BIG_INT, ensureHex } from '@webb-tools/dapp-config';
import { CurrencyConfig } from '@webb-tools/dapp-config/currencies/currency-config.interface';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types';
import getViemClient from '@webb-tools/web3-api-provider/utils/getViemClient';
import { WebbWeb3Provider } from '@webb-tools/web3-api-provider';
import { FungibleTokenWrapper__factory } from '@webb-tools/contracts';
import numberToString from '@webb-tools/webb-ui-components/utils/numberToString';
import {
  AMOUNT_KEY,
  POOL_KEY,
  SOURCE_CHAIN_KEY,
  TOKEN_KEY,
  UNWRAP_FULL_PATH,
} from '../../../../../constants';
import {
  useConnectButtonProps,
  useEnqueueSubmittedTx,
} from '../../../../../hooks';
import handleTxError from '../../../../../utils/handleTxError';

export default function useUnwrapButtonProps({
  balance,
  fungibleCfg,
  wrappableCfg,
}: {
  balance?: number;
  fungibleCfg?: CurrencyConfig;
  wrappableCfg?: CurrencyConfig;
}) {
  const { activeApi, loading, isConnecting, apiConfig } = useWebContext();
  const enqueueSubmittedTx = useEnqueueSubmittedTx();
  const navigate = useNavigate();

  const [query] = useQueryParams({
    [AMOUNT_KEY]: StringParam,
    [TOKEN_KEY]: NumberParam,
    [POOL_KEY]: NumberParam,
    [SOURCE_CHAIN_KEY]: NumberParam,
  });

  const {
    [AMOUNT_KEY]: amount,
    [TOKEN_KEY]: wrappableTokenId,
    [POOL_KEY]: fungibleTokenId,
    [SOURCE_CHAIN_KEY]: srcTypedId,
  } = query;

  const { content: connectBtnCnt, handleConnect } = useConnectButtonProps(
    srcTypedId,
    true,
  );

  const [isUnwrapping, setIsUnwrapping] = useState(false);

  const isValidAmount = useMemo(() => {
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
    if (typeof fungibleTokenId !== 'number') {
      return 'Select token to be unwrapped';
    }

    if (typeof amount !== 'string' || amount.length === 0) {
      return 'Enter amount';
    }

    if (typeof wrappableTokenId !== 'number') {
      return 'Select unwrapped token';
    }

    if (typeof srcTypedId !== 'number') {
      return 'Select chain';
    }

    return undefined;
  }, [amount, fungibleTokenId, wrappableTokenId, srcTypedId]);

  const amountCnt = useMemo(() => {
    if (typeof amount !== 'string' || BigInt(amount) === ZERO_BIG_INT) {
      return 'Enter amount';
    }

    if (!isValidAmount) {
      return 'Insufficient balance';
    }
  }, [amount, isValidAmount]);

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

    if (isUnwrapping) {
      return 'Unwrapping';
    }

    return 'Unwrap';
  }, [amountCnt, connectBtnCnt, inputCnt, isUnwrapping]);

  const isDisabled = useMemo(
    () => {
      if (connectBtnCnt) {
        return false;
      }

      const allInputsFilled =
        !!amount && !!wrappableTokenId && !!fungibleTokenId && !!srcTypedId;

      if (!allInputsFilled || !isValidAmount || isUnwrapping) {
        return true;
      }

      return false;
    },
    // prettier-ignore
    [amount, connectBtnCnt, fungibleTokenId, srcTypedId, wrappableTokenId, isValidAmount, isUnwrapping],
  );

  const isLoading = useMemo(() => {
    return loading || isConnecting;
  }, [isConnecting, loading]);

  const handleBtnClick = useCallback(
    async () => {
      let actualApi = activeApi;

      try {
        if (connectBtnCnt && typeof srcTypedId === 'number') {
          const nextApi = await handleConnect(srcTypedId);
          if (!nextApi) {
            return;
          }

          actualApi = nextApi;
        }

        if (!actualApi || !(actualApi instanceof WebbWeb3Provider)) {
          throw WebbError.from(WebbErrorCodes.ApiNotReady);
        }

        if (!fungibleCfg) {
          throw WebbError.from(WebbErrorCodes.NoFungibleTokenAvailable);
        }

        const srcTypedIdNum = Number(srcTypedId);

        if (Number.isNaN(srcTypedIdNum)) {
          throw WebbError.from(WebbErrorCodes.UnsupportedChain);
        }

        const fungibleContractAddr = fungibleCfg?.addresses.get(srcTypedIdNum);
        if (fungibleContractAddr === undefined) {
          throw WebbError.from(WebbErrorCodes.NoFungibleTokenAvailable);
        }

        const wrappableTokenAddr = wrappableCfg?.addresses.get(srcTypedIdNum);
        if (wrappableCfg === undefined || wrappableTokenAddr === undefined) {
          throw WebbError.from(WebbErrorCodes.NoWrappableTokenAvailable);
        }

        const srcChain = apiConfig.chains[srcTypedIdNum];

        if (!srcChain) {
          throw WebbError.from(WebbErrorCodes.UnsupportedChain);
        }

        if (typeof amount !== 'string' || amount.length === 0) {
          throw WebbError.from(WebbErrorCodes.InvalidAmount);
        }

        setIsUnwrapping(true);
        const client = getViemClient(srcTypedIdNum);
        const unwrapTokenAddrHex = ensureHex(wrappableTokenAddr);
        const fungibleContractHex = ensureHex(fungibleContractAddr);

        const walletClient = actualApi.walletClient;
        const { request } = await client.simulateContract({
          address: fungibleContractHex,
          abi: FungibleTokenWrapper__factory.abi,
          functionName: 'unwrap',
          args: [unwrapTokenAddrHex, BigInt(amount)],
          account: walletClient.account,
        });
        const txHash = await walletClient.writeContract(request);

        enqueueSubmittedTx(txHash, srcChain, 'unwrap');

        // navigate back to unwrap page to clear query params
        navigate(UNWRAP_FULL_PATH);
      } catch (error) {
        console.error(error);

        handleTxError(error, 'Unwrap');
      } finally {
        setIsUnwrapping(false);
      }
    },
    // prettier-ignore
    [activeApi, amount, fungibleCfg, wrappableCfg, connectBtnCnt, srcTypedId, handleConnect, enqueueSubmittedTx, apiConfig, navigate],
  );

  return {
    children,
    isLoading,
    loadingText: 'Connecting...',
    onClick: handleBtnClick,
    isDisabled,
  };
}
