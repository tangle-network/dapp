import { Button } from '@webb-tools/webb-ui-components';
import { useObservableState } from 'observable-hooks';
import { useMemo } from 'react';

import { useFaucetContext } from '../provider';

const MintButtonContainer = () => {
  const { inputValues$, twitterHandle$ } = useFaucetContext();

  const inputValues = useObservableState(inputValues$);

  const isDisabled = useMemo(() => {
    return (
      !inputValues?.token ||
      !inputValues?.chain ||
      !inputValues?.contractAddress ||
      !inputValues?.recepient ||
      !twitterHandle$
    );
  }, [
    inputValues?.chain,
    inputValues?.contractAddress,
    inputValues?.recepient,
    inputValues?.token,
    twitterHandle$,
  ]);

  return (
    <Button isDisabled={isDisabled} className="mx-auto">
      Mint Tokens
    </Button>
  );
};

export default MintButtonContainer;
