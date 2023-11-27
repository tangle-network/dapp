import isValidAddress from '@webb-tools/dapp-types/utils/isValidAddress';
import { useEffect, useState } from 'react';
import { BooleanParam, StringParam, useQueryParams } from 'use-query-params';
import {
  HAS_REFUND_KEY,
  IS_CUSTOM_AMOUNT_KEY,
  RECIPIENT_KEY,
} from '../../../../../constants';
import useAmountWithRoute from '../../../../../hooks/useAmountWithRoute';
import useDefaultChainAndPool from '../../../../../hooks/useDefaultChainAndPool';

const useInputs = () => {
  const [amount, setAmount] = useAmountWithRoute();

  const [query, setQuery] = useQueryParams({
    [RECIPIENT_KEY]: StringParam,
    [HAS_REFUND_KEY]: BooleanParam,
    [IS_CUSTOM_AMOUNT_KEY]: BooleanParam,
  });

  const {
    [RECIPIENT_KEY]: recipient,
    [HAS_REFUND_KEY]: hasRefund,
    [IS_CUSTOM_AMOUNT_KEY]: isCustom,
  } = query;

  const [recipientErrorMsg, setRecipientErrorMsg] = useState('');

  useDefaultChainAndPool();

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
    recipient: recipient ?? '',
    hasRefund: Boolean(hasRefund),
    isCustom: Boolean(isCustom),
    setRecipient: (recipient: string) =>
      setQuery({ [RECIPIENT_KEY]: recipient }),
    setHasRefund: (hasRefund: boolean) =>
      setQuery({ [HAS_REFUND_KEY]: hasRefund }),
    setCustomAmount: (isCustom: boolean) =>
      setQuery({ [IS_CUSTOM_AMOUNT_KEY]: isCustom }),
    recipientErrorMsg,
  };
};

export default useInputs;
