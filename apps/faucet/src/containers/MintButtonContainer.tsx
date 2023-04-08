import { Button } from '@webb-tools/webb-ui-components';
import { useObservableState } from 'observable-hooks';
import { useCallback, useMemo, useState } from 'react';

import { useFaucetContext } from '../provider';
import useStore, { StoreKey } from '../store';

// Mocked implementation of minting tokens
const mintTokens = () =>
  new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 3000));

const MintButtonContainer = () => {
  const { inputValues$, isMintingModalOpen$, isMintingSuccess$ } =
    useFaucetContext();

  const [getStore] = useStore();

  const twitterHandle = useMemo(
    () => getStore(StoreKey.twitterHandle),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getStore(StoreKey.twitterHandle)]
  );

  const inputValues = useObservableState(inputValues$);

  const isDisabled = useMemo(() => {
    return (
      !inputValues?.token ||
      !inputValues?.chain ||
      !inputValues?.contractAddress ||
      !inputValues?.recepient ||
      !twitterHandle
    );
  }, [
    inputValues?.chain,
    inputValues?.contractAddress,
    inputValues?.recepient,
    inputValues?.token,
    twitterHandle,
  ]);

  // Mocked implementation of minting tokens
  const handleMintTokens = useCallback(async () => {
    const confirmMessage = `Mint tokens with the following values ${JSON.stringify(
      inputValues
    )}`;
    const isConfirm = confirm(confirmMessage);
    if (!isConfirm) {
      return;
    }

    try {
      isMintingModalOpen$.next(true);
      const isMinted = await mintTokens();
      if (isMinted) {
        isMintingSuccess$.next(true);
      }
    } catch (error) {
      console.error('Error minting tokens', error);
    }
  }, [inputValues, isMintingModalOpen$, isMintingSuccess$]);

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
