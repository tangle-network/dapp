import React, { useState } from 'react';
import styled from 'styled-components';
import { NoteInput } from '@webb-dapp/ui-components/Inputs/NoteInput/NoteInput';
import { InputLabel } from '@webb-dapp/ui-components/Inputs/InputLabel/InputLabel';
import { FormHelperText, InputBase } from '@material-ui/core';
import { SpaceBox } from '@webb-dapp/ui-components';
import { MixerButton } from '@webb-dapp/mixer/components/MixerButton/MixerButton';
import { useWithdraw } from '@webb-dapp/mixer';
import WithdrawingModal from '@webb-dapp/mixer/components/Withdraw/WithdrawingModal';

const WithdrawWrapper = styled.div``;
type WithdrawProps = {};

export const Withdraw: React.FC<WithdrawProps> = () => {
  const [note, setNote] = useState('');

  const {
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

  return (
    <WithdrawWrapper>
      <NoteInput error={note ? validationErrors.note : ''} value={note} onChange={setNote} />

      <SpaceBox height={16} />

      <InputLabel label={'Note'}>
        <InputBase
          value={withdrawTo}
          onChange={(event) => {
            setWithdrawTo(event.target.value as string);
          }}
          fullWidth
          placeholder={`Enter account address`}
        />
        <FormHelperText error={Boolean(validationErrors.withdrawTo && withdrawTo)}>
          {validationErrors.withdrawTo}
        </FormHelperText>
      </InputLabel>

      <SpaceBox height={16} />

      <MixerButton disabled={!withdrawTo || !canWithdraw} onClick={withdraw} label={'Withdraw'} />

      <WithdrawingModal withdrawTxInfo={withdrawTxInfo} cancel={cancelWithdraw} stage={stage} canCancel={canCancel} />
    </WithdrawWrapper>
  );
};
