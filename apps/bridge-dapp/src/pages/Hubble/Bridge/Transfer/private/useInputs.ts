import isValidAddress from '@webb-tools/dapp-types/utils/isValidAddress';
import isValidPublicKey from '@webb-tools/dapp-types/utils/isValidPublicKey';
import { useCallback, useEffect, useState } from 'react';
import {
  BooleanParam,
  StringParam,
  useQueryParams,
  type UrlUpdateType,
} from 'use-query-params';
import {
  HAS_REFUND_KEY,
  RECIPIENT_KEY,
  REFUND_RECIPIENT_KEY,
} from '../../../../../constants';
import useAmountWithRoute from '../../../../../hooks/useAmountWithRoute';
import useDefaultChainAndPool from '../../../../../hooks/useDefaultChainAndPool';

const useInputs = () => {
  const [amount, setAmount] = useAmountWithRoute();

  const [query, setQuery] = useQueryParams({
    [RECIPIENT_KEY]: StringParam,
    [HAS_REFUND_KEY]: BooleanParam,
    [REFUND_RECIPIENT_KEY]: StringParam,
  });

  const {
    [RECIPIENT_KEY]: recipient,
    [HAS_REFUND_KEY]: hasRefund,
    [REFUND_RECIPIENT_KEY]: refundRecipient,
  } = query;

  const [recipientErrorMsg, setRecipientErrorMsg] = useState('');

  const [refundRecipientErrorMsg, setRefundRecipientErrorMsg] = useState('');

  useDefaultChainAndPool();

  // Validate recipient public key after 0.5s
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

  // Validate refund recipient wallet address after 0.5s
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

  const onHasRefundChange = useCallback(
    (
      newValue:
        | typeof hasRefund
        | ((latestValue: typeof hasRefund) => typeof hasRefund),
      updateType?: UrlUpdateType
    ) => {
      let nextValue: typeof hasRefund;
      if (typeof newValue === 'function') {
        nextValue = newValue(hasRefund);
      } else {
        nextValue = newValue;
      }

      setQuery(
        {
          [HAS_REFUND_KEY]: nextValue,
          ...(Boolean(nextValue) === false
            ? {
                [REFUND_RECIPIENT_KEY]: undefined,
              }
            : {}),
        },
        updateType
      );
    },
    [hasRefund, setQuery]
  );

  return {
    amount,
    hasRefund: Boolean(hasRefund),
    recipient: recipient ?? '',
    recipientErrorMsg,
    refundRecipient: refundRecipient ?? '',
    refundRecipientErrorMsg,
    setAmount,
    setHasRefund: onHasRefundChange,
    setRecipient: (recipient: string) =>
      setQuery({ [RECIPIENT_KEY]: recipient }),
    setRefundRecipient: (refundRecipient: string) =>
      setQuery({ [REFUND_RECIPIENT_KEY]: refundRecipient }),
  };
};

export default useInputs;
