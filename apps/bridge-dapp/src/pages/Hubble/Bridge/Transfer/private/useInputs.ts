import isValidPublicKey from '@webb-tools/dapp-types/utils/isValidPublicKey';
import { useEffect, useState } from 'react';
import { IS_CUSTOM_AMOUNT_KEY, RECIPIENT_KEY } from '../../../../../constants';
import useAmountWithRoute from '../../../../../hooks/useAmountWithRoute';
import useStateWithRoute from '../../../../../hooks/useStateWithRoute';

const useInputs = () => {
  const [amount, setAmount] = useAmountWithRoute();

  const [recipient, setRecipient] = useStateWithRoute(RECIPIENT_KEY);

  const [isCustom, setIsCustom] = useStateWithRoute(IS_CUSTOM_AMOUNT_KEY);

  const [recipientErrorMsg, setRecipientErrorMsg] = useState('');

  // Validate recipient input address after 1s
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (recipient && !isValidPublicKey(recipient)) {
        setRecipientErrorMsg('Invalid address');
      } else {
        setRecipientErrorMsg('');
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [recipient]);

  return {
    amount,
    setAmount,
    recipient,
    setRecipient,
    isCustom,
    setIsCustom,
    recipientErrorMsg,
  };
};

export default useInputs;
