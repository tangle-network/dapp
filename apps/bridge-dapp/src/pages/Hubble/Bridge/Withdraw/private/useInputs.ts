import useAmountWithRoute from '../../../../../hooks/useAmountWithRoute';
import useStateWithRoute from '../../../../../hooks/useStateWithRoute';
import {
  HAS_REFUND_KEY,
  IS_CUSTOM_AMOUNT_KEY,
  RECIPIENT_KEY,
  REFUND_AMOUNT_KEY,
} from '../../../../../constants';
import { useEffect, useState } from 'react';
import isValidAddress from '@webb-tools/dapp-types/utils/isValidAddress';

const useInputs = () => {
  const [amount, setAmount] = useAmountWithRoute();

  const [refundAmount, setRefundAmount] = useAmountWithRoute(REFUND_AMOUNT_KEY);

  const [recipient, setRecipient] = useStateWithRoute(RECIPIENT_KEY);

  const [hasRefund, setHasRefund] = useStateWithRoute(HAS_REFUND_KEY);

  const [isCustom, setIsCustom] = useStateWithRoute(IS_CUSTOM_AMOUNT_KEY);

  const [recipientErrorMsg, setRecipientErrorMsg] = useState('');

  // Validate recipient input address after 1s
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (recipient && !isValidAddress(recipient)) {
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
    refundAmount,
    setRefundAmount,
    recipient,
    setRecipient,
    hasRefund,
    setHasRefund,
    isCustom,
    setIsCustom,
    recipientErrorMsg,
  };
};

export default useInputs;
