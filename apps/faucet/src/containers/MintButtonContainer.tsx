import { LoggerService } from '@webb-tools/browser-utils';
import { ZERO_BIG_INT } from '@webb-tools/dapp-config/constants';
import { SubstrateChainId } from '@webb-tools/dapp-types/SubstrateChainId';
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
import {
  ChainType,
  MintTokenBody,
  MintTokenErrorCodes,
  TooManyClaimResponse,
} from '../types';
import isAllowSubstrateAddress from '../utils/isAllowSubstrateAddress';
import isTooManyClaimResponse from '../utils/isTooManyClaimResponse';
import safeParseJSON from '../utils/safeParseJSON';

const logger = LoggerService.get('MintButtonContainer');

const mintTokens = async (
  accessToken: string,
  inputValues: InputValuesType,
  config: FaucetContextType['config'],
  abortSignal?: AbortSignal
): Promise<Result<MintTokenBody, FaucetError<MintTokenErrorCodes>>> => {
  const {
    chain: typedChainId,
    recepient,
    recepientAddressType,
    contractAddress,
  } = inputValues;

  if (!contractAddress) {
    return err(FaucetError.from(FaucetErrorCode.MISSING_CONTRACT_ADDRESS));
  }

  if (!typedChainId) {
    return err(FaucetError.from(FaucetErrorCode.INVALID_SELECTED_CHAIN));
  }

  const chain = config[typedChainId];
  if (!chain) {
    return err(
      FaucetError.from(FaucetErrorCode.INVALID_SELECTED_CHAIN, {
        selectedChain: chain,
      })
    );
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  } as const satisfies HeadersInit;

  type T = {
    [chainType in ChainType]: {
      type: chainType;
      id: number;
    };
  }[ChainType];

  const useSubstrate =
    isAllowSubstrateAddress(typedChainId, contractAddress) &&
    recepientAddressType === 'substrate';

  const typedChainIdReq: T = useSubstrate
    ? {
        id: SubstrateChainId.TangleTestnetNative,
        type: 'Substrate',
      }
    : {
        id: chain.chainId,
        type: chain.type,
      };

  const onlyNativeToken = BigInt(contractAddress) === ZERO_BIG_INT;

  const body = {
    faucet: {
      onlyNativeToken,
      typedChainId: {
        id: typedChainIdReq.id,
        type: typedChainIdReq.type,
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
      const result = await safeParseJSON<
        { code: number; message: string } | TooManyClaimResponse
      >(response);
      if (result.isOk()) {
        const data = result.value;

        if (!isTooManyClaimResponse(data)) {
          return err(
            FaucetError.from(FaucetErrorCode.MINT_TOKENS_FAILED, {
              extraInfo: data.message,
              status: data.code,
            })
          );
        } else {
          return err(
            FaucetError.from(FaucetErrorCode.TOO_MANY_CLAIM_REQUESTS, {
              claimPeriod: data.time_to_wait_between_claims_ms ?? undefined,
              error: data.error,
              lastClaimedDate: data.last_claimed_date
                ? new Date(data.last_claimed_date)
                : undefined,
              reason: data.reason,
            })
          );
        }
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

  const isDisabled = useMemo(
    () => {
      return (
        !inputValues?.token ||
        !inputValues?.chain ||
        !inputValues?.contractAddress ||
        !isValidRecipient ||
        !twitterHandle ||
        !inputValues.isValidRecipientAddress
      );
    },
    // prettier-ignore
    [inputValues?.chain, inputValues?.contractAddress, inputValues.isValidRecipientAddress, inputValues?.token, isValidRecipient, twitterHandle]
  );

  // Mocked implementation of minting tokens
  const handleMintTokens = useCallback(
    async () => {
      if (!accessToken) {
        return;
      }

      isMintingModalOpen$.next(true);
      const result = await mintTokens(accessToken, inputValues, config);
      result.match(
        (res) => {
          mintTokenResult$.next(res);
          isMintingSuccess$.next(true);
        },
        (err) => {
          logger.error('Minting tokens failed', err.message);
          mintTokenResult$.next(err);
        }
      );
    },
    // prettier-ignore
    [accessToken, config, inputValues, isMintingModalOpen$, isMintingSuccess$, mintTokenResult$]
  );

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
