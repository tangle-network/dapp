import isValidAddress from '@webb-tools/dapp-types/utils/isValidAddress';
import isValidPublicKey from '@webb-tools/dapp-types/utils/isValidPublicKey';
import { useEffect, useState } from 'react';
import {
  HAS_REFUND_KEY,
  IS_CUSTOM_AMOUNT_KEY,
  RECIPIENT_KEY,
  REFUND_RECIPIENT_KEY,
} from '../../../../../constants';
import useAmountWithRoute from '../../../../../hooks/useAmountWithRoute';
import useStateWithRoute from '../../../../../hooks/useStateWithRoute';

const useInputs = () => {
  const [amount, setAmount] = useAmountWithRoute();

  const [recipient, setRecipient] = useStateWithRoute(RECIPIENT_KEY);

  const [hasRefund, setHasRefund] = useStateWithRoute(HAS_REFUND_KEY);

  const [refundRecipient, setRefundRecipient] =
    useStateWithRoute(REFUND_RECIPIENT_KEY);

  const [isCustom, setIsCustom] = useStateWithRoute(IS_CUSTOM_AMOUNT_KEY);

  const [recipientErrorMsg, setRecipientErrorMsg] = useState('');

  const [refundRecipientErrorMsg, setRefundRecipientErrorMsg] = useState('');

  // Reset the refund recipient if the user toggles the refund switch
  useEffect(() => {
    if (!hasRefund) {
      setRefundRecipient('');
    }
  }, [hasRefund, setRefundRecipient]);

  // Validate recipient input address after 0.5s
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (recipient && !isValidPublicKey(recipient)) {
        setRecipientErrorMsg('Invalid shielded account');
      } else {
        setRecipientErrorMsg('');
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [recipient]);

  // Validate refund recipient input address after 0.5s
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (refundRecipient && !isValidAddress(refundRecipient)) {
        setRefundRecipientErrorMsg('Invalid wallet address');
      } else {
        setRefundRecipientErrorMsg('');
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [refundRecipient]);

  return {
    amount,
    hasRefund,
    isCustom,
    recipient,
    recipientErrorMsg,
    refundRecipient,
    refundRecipientErrorMsg,
    setAmount,
    setHasRefund,
    setIsCustom,
    setRecipient,
    setRefundRecipient,
  };
};

export default useInputs;
