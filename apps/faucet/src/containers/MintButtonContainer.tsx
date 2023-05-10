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
import safeParseJSON from '../utils/safeParseJSON';

const logger = LoggerService.get('MintButtonContainer');

// Mocked implementation of minting tokens
const mintTokens = async (
  accessToken: string,
  { chain: chainName, recepient, recepientAddressType }: InputValuesType,
  config: FaucetContextType['config'],
  abortSignal?: AbortSignal
): Promise<
  Result<
    void,
    FaucetError<
      | FaucetErrorCode.INVALID_SELECTED_CHAIN
      | FaucetErrorCode.MINT_TOKENS_FAILED
      | FaucetErrorCode.JSON_PARSE_ERROR
    >
  >
> => {
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
  };

  const body = {
    faucet: {
      typedChainId: {
        id: chain.chainId,
        type: chain.type,
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

    const result = await safeParseJSON(response);
    if (result.isErr()) {
      return err(result.error);
    }

    return ok(result.value as any); // TODO: Determine the type of the response
  } catch (error) {
    return err(
      FaucetError.from(FaucetErrorCode.MINT_TOKENS_FAILED, {
        extraInfo: JSON.stringify(error, null, 2),
      })
    );
  }
};

const MintButtonContainer = () => {
  const { config, inputValues$, isMintingModalOpen$, isMintingSuccess$ } =
    useFaucetContext();

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
    const confirmMessage = `Mint tokens with the following values\n${JSON.stringify(
      inputValues,
      null,
      2
    )}`;
    const isConfirm = confirm(confirmMessage);
    if (!isConfirm || !accessToken) {
      return;
    }

      isMintingModalOpen$.next(true);
      const result = await mintTokens(accessToken, inputValues, config);
      result.match(
        (res) => {
          window.alert('Minting tokens succeeded with payload: ' + JSON.stringify(res, null, 2));
          isMintingSuccess$.next(true)
        },
        (err) => { // TODO: Handle returned error here
          logger.error('Minting tokens failed', err.message);
          isMintingModalOpen$.next(false)
        },
      )
  }, [accessToken, config, inputValues, isMintingModalOpen$, isMintingSuccess$]); // prettier-ignore

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