import { useCallback, useMemo, useState } from 'react';
import { useQueryParams, NumberParam, StringParam } from 'use-query-params';
import { parseEther } from 'viem';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { ZERO_BIG_INT, chainsPopulated } from '@webb-tools/dapp-config';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types';
import { CurrencyConfig } from '@webb-tools/dapp-config/currencies/currency-config.interface';
import { FungibleTokenWrapper__factory } from '@webb-tools/contracts';
import getViemClient from '@webb-tools/web3-api-provider/utils/getViemClient';
import numberToString from '@webb-tools/webb-ui-components/utils/numberToString';
import handleTxError from '../../../../../utils/handleTxError';
import { ZERO_ADDRESS } from '@webb-tools/utils';
import {
  useEnqueueSubmittedTx,
  useConnectButtonProps,
} from '../../../../../hooks';
import { WebbWeb3Provider } from '@webb-tools/web3-api-provider';
import {
  AMOUNT_KEY,
  POOL_KEY,
  SOURCE_CHAIN_KEY,
  TOKEN_KEY,
} from '../../../../../constants';

export default function useWrapButtonProps({
  balances,
  fungibleCfg,
  wrappableCfg,
}: {
  balances?: number;
  fungibleCfg?: CurrencyConfig;
  wrappableCfg?: CurrencyConfig;
}) {
  const { activeApi, loading, isConnecting, noteManager, apiConfig } =
    useWebContext();
  const enqueueSubmittedTx = useEnqueueSubmittedTx();

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

  const { content: connectBtnCnt, handleConnect } =
    useConnectButtonProps(srcTypedId);

  const [isWrapping, setIsWrapping] = useState(false);

  const isValidAmount = useMemo(() => {
    if (typeof amount !== 'string' || amount.length === 0) {
      return false;
    }

    const amountBI = BigInt(amount); // amount from search params is parsed already

    // If balances is not a number, but amount is entered and > 0,
    // it means user not connected to wallet but entered amount
    // so we allow it
    if (typeof balances !== 'number' && amountBI > 0) {
      return true;
    }

    if (!balances || amountBI <= 0) {
      return false;
    }

    const parsedBalance = parseEther(numberToString(balances));

    return amountBI !== ZERO_BIG_INT && amountBI <= parsedBalance;
  }, [amount, balances]);

  const inputCnt = useMemo(() => {
    if (typeof wrappableTokenId !== 'number') {
      return 'Select token to be wrapped';
    }

    if (typeof amount !== 'string' || amount.length === 0) {
      return 'Enter amount';
    }

    if (typeof fungibleTokenId !== 'number') {
      return 'Select wrapped token';
    }

    if (typeof srcTypedId !== 'number') {
      return 'Select source chain';
    }

    return undefined;
  }, [amount, fungibleTokenId, wrappableTokenId, srcTypedId]);

  const amountCnt = useMemo(() => {
    if (typeof amount !== 'string' || BigInt(amount) === ZERO_BIG_INT) {
      return 'Enter amount';
    }

    if (!isValidAmount) {
      return 'Insufficient balances';
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

    if (isWrapping) {
      return 'Wrapping';
    }

    return 'Wrap';
  }, [amountCnt, connectBtnCnt, inputCnt, isWrapping]);

  const isDisabled = useMemo(
    () => {
      if (connectBtnCnt) {
        return false;
      }

      const allInputsFilled =
        !!amount && !!wrappableTokenId && !!fungibleTokenId && !!srcTypedId;

      if (!allInputsFilled || !isValidAmount) {
        return true;
      }

      if (isWrapping) {
        return true;
      }

      return false;
    },
    // prettier-ignore
    [amount, connectBtnCnt, fungibleTokenId, srcTypedId, wrappableTokenId, isValidAmount, isWrapping]
  );

  const isLoading = useMemo(() => {
    return loading || isConnecting;
  }, [isConnecting, loading]);

  const handleBtnClick = useCallback(
    async () => {
      let actualApi = activeApi;

      try {
        setIsWrapping(true);
        if (connectBtnCnt && typeof srcTypedId === 'number') {
          const nextApi = await handleConnect(srcTypedId);
          if (!nextApi?.noteManager) {
            throw WebbError.from(WebbErrorCodes.ApiNotReady);
          }

          actualApi = nextApi;
        }

        if (
          !noteManager ||
          !actualApi ||
          !(actualApi instanceof WebbWeb3Provider)
        ) {
          throw WebbError.from(WebbErrorCodes.ApiNotReady);
        }

        if (fungibleCfg === undefined) {
          throw WebbError.from(WebbErrorCodes.NoFungibleTokenAvailable);
        }

        const fungibleTokenIdNum = Number(fungibleTokenId);
        if (Number.isNaN(fungibleTokenIdNum)) {
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

        const srcChain = chainsPopulated[srcTypedIdNum];
        if (!srcChain) {
          throw WebbError.from(WebbErrorCodes.UnsupportedChain);
        }

        if (typeof amount !== 'string' || amount.length === 0) {
          throw WebbError.from(WebbErrorCodes.InvalidAmount);
        }

        const client = getViemClient(srcTypedIdNum);
        const wrapTokenAddrHex = `0x${wrappableTokenAddr.replace(
          /^0x/,
          ''
        )}` as const;
        const fungibleContractHex = `0x${fungibleContractAddr.replace(
          /^0x/,
          ''
        )}` as const;

        const walletClient = actualApi.walletClient;
        const { request } = await client.simulateContract({
          address: fungibleContractHex,
          abi: FungibleTokenWrapper__factory.abi,
          functionName: 'wrap',
          args: [
            wrapTokenAddrHex,
            // if native token, amount is 0
            wrapTokenAddrHex === ZERO_ADDRESS
              ? parseEther('0')
              : BigInt(amount),
          ],
          account: walletClient.account,
          // if native token, tx value is equal amount
          value:
            wrapTokenAddrHex === ZERO_ADDRESS
              ? BigInt(amount)
              : parseEther('0'),
        });

        const txHash = await walletClient.writeContract(request);

        enqueueSubmittedTx(txHash, apiConfig.chains[+srcTypedIdNum], 'wrap');
      } catch (error) {
        console.error(error);

        handleTxError(error, 'Wrap');
      } finally {
        setIsWrapping(false);
      }
    },
    // prettier-ignore
    [activeApi, amount, fungibleTokenId, connectBtnCnt, srcTypedId, handleConnect, noteManager, fungibleCfg, wrappableCfg, enqueueSubmittedTx, apiConfig]
  );

  return {
    children,
    isLoading,
    loadingText: 'Connecting...',
    onClick: handleBtnClick,
    isDisabled,
  };
}
