import { LoggerService } from '@webb-tools/browser-utils';
import isValidAddress from '@webb-tools/dapp-types/utils/isValidAddress';
import { Button } from '@webb-tools/webb-ui-components';
import { err, ok, Result } from 'neverthrow';
import { useObservableState } from 'observable-hooks';
import { useCallback, useMemo } from 'react';

import clientConfig from '../config/client';
import FaucetError from '../errors/FaucetError';
import FaucetErrorCode from '../errors/FaucetErrorCode';
import {
  FaucetContextType,
  InputValuesType,
  useFaucetContext,
} from '../provider';
import useStore, { StoreKey } from '../store';
import { MintTokenBody, MintTokenErrorCodes } from '../types';
import safeParseJSON from '../utils/safeParseJSON';

const logger = LoggerService.get('MintButtonContainer');

const mintTokens = async (
  accessToken: string,
  { chain: chainName, recepient, recepientAddressType }: InputValuesType,
  config: FaucetContextType['config'],
  abortSignal?: AbortSignal
): Promise<Result<MintTokenBody, FaucetError<MintTokenErrorCodes>>> => {
  if (!chainName) {
    return err(FaucetError.from(FaucetErrorCode.INVALID_SELECTED_CHAIN));
  }

  const chain = config[chainName];
  if (!chain) {
    return err(
      FaucetError.from(FaucetErrorCode.INVALID_SELECTED_CHAIN, {
        selectedChain: chainName,
      })
    );
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  } as const satisfies HeadersInit;

  const body = {
    faucet: {
      typedChainId: {
        [chain.type]: chain.chainId,
      },
      walletAddress: {
        type: recepientAddressType,
        value: recepient,
      },
    },
  };

  try {
    const response = await fetch(clientConfig.mintTokensUrl, {
      body: JSON.stringify(body),
      headers,
      method: 'POST',
      signal: abortSignal,
    });

    if (!response.ok) {
      const result = await safeParseJSON<{ code: number; message: string }>(
        response
      );
      if (result.isOk()) {
        const data = result.value;
        return err(
          FaucetError.from(FaucetErrorCode.MINT_TOKENS_FAILED, {
            extraInfo: data.message,
            status: data.code,
          })
        );
      } else {
        return err(result.error);
      }
    }

    const result = await safeParseJSON<MintTokenBody>(response);
    if (result.isErr()) {
      return err(result.error);
    }

    return ok(result.value); // TODO: Determine the type of the response
  } catch (error) {
    return err(
      FaucetError.from(FaucetErrorCode.MINT_TOKENS_FAILED, {
        extraInfo: JSON.stringify(error, null, 2),
      })
    );
  }
};

const MintButtonContainer = () => {
  const {
    config,
    inputValues$,
    isMintingModalOpen$,
    isMintingSuccess$,
    mintTokenResult$,
  } = useFaucetContext();

  const [getStore] = useStore();

  const accessToken = useMemo(() => {
    return getStore(StoreKey.accessToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getStore(StoreKey.accessToken)]);

  const twitterHandle = useMemo(
    () => getStore(StoreKey.twitterHandle),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getStore(StoreKey.twitterHandle)]
  );

  const inputValues = useObservableState(inputValues$);

  const isValidRecipient = useMemo(() => {
    return (
      inputValues?.recepientAddressType === 'ethereum' ||
      inputValues?.recepientAddressType === 'substrate' ||
      !inputValues.recepient ||
      !isValidAddress(inputValues.recepient)
    );
  }, [inputValues.recepient, inputValues?.recepientAddressType]);

  const isDisabled = useMemo(() => {
    return (
      !inputValues?.token ||
      !inputValues?.chain ||
      !inputValues?.contractAddress ||
      !isValidRecipient ||
      !twitterHandle
    );
  }, [
    inputValues?.chain,
    inputValues?.contractAddress,
    inputValues?.token,
    isValidRecipient,
    twitterHandle,
  ]);

  // Mocked implementation of minting tokens
  const handleMintTokens = useCallback(async () => {
    if (!accessToken) {
      return;
    }

      isMintingModalOpen$.next(true);
      const result = await mintTokens(accessToken, inputValues, config);
      result.match(
        (res) => {
          mintTokenResult$.next(res);
          isMintingSuccess$.next(true)
        },
        (err) => {
          logger.error('Minting tokens failed', err.message);
          mintTokenResult$.next(err);
        },
      )
  }, [accessToken, config, inputValues, isMintingModalOpen$, isMintingSuccess$, mintTokenResult$]); // prettier-ignore

  return (
    <>
      <Button
        onClick={handleMintTokens}
        isDisabled={isDisabled}
        className="mx-auto"
      >
        Mint Tokens
      </Button>
    </>
  );
};

export default MintButtonContainer;
