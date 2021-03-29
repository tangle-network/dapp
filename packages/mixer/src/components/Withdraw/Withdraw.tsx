import React, { useState } from 'react';
import styled from 'styled-components';
import { useWithdraw } from '../../hooks';

const WithdrawWrapper = styled.div``;
type WithdrawProps = {};

export const Withdraw: React.FC<WithdrawProps> = () => {
  const [note, setNote] = useState('');

  const {
    accounts,
    canCancel,
    canWithdraw,
    cancelWithdraw,
    setWithdrawTo,
    stage,
    validationErrors,
    withdraw,
    withdrawTo,
    withdrawTxInfo,
  } = useWithdraw(note);

  return <WithdrawWrapper>Withdraw</WithdrawWrapper>;
};
