import { FormHelperText, InputBase } from '@material-ui/core';
import { MixerButton } from '@webb-dapp/mixer/components/MixerButton/MixerButton';
import WithdrawingModal from '@webb-dapp/mixer/components/Withdraw/WithdrawingModal';
import { SpaceBox } from '@webb-dapp/ui-components';
import { InputLabel } from '@webb-dapp/ui-components/Inputs/InputLabel/InputLabel';
import { NoteInput } from '@webb-dapp/ui-components/Inputs/NoteInput/NoteInput';
import React, { useState } from 'react';
import styled from 'styled-components';
import { useWithdraw } from '@webb-dapp/mixer/hooks';

const WithdrawWrapper = styled.div``;
type WithdrawProps = {};

export const Withdraw: React.FC<WithdrawProps> = () => {
  const [note, setNote] = useState('');
  const [recipient, setRecipient] = useState('');

  const { canCancel, validationErrors, cancelWithdraw, stage, withdraw } = useWithdraw({
    recipient,
    note,
  });

  return (
    <WithdrawWrapper>
      <NoteInput error={note ? validationErrors.note : ''} value={note} onChange={setNote} />

      <SpaceBox height={16} />

      <InputLabel label={'Recipient'}>
        <InputBase
          value={recipient}
          onChange={(event) => {
            setRecipient(event.target.value as string);
          }}
          fullWidth
          placeholder={`Enter account address`}
        />
        <FormHelperText error={Boolean(validationErrors.recipient && recipient)}>
          {validationErrors.recipient}
        </FormHelperText>
      </InputLabel>

      <SpaceBox height={16} />

      <MixerButton disabled={!recipient} onClick={withdraw} label={'Withdraw'} />

      <WithdrawingModal
        withdrawTxInfo={{
          account: recipient,
        }}
        cancel={cancelWithdraw}
        stage={stage}
        canCancel={canCancel}
      />
    </WithdrawWrapper>
  );
};
