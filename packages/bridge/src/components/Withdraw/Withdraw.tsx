import { FormHelperText, InputBase } from '@material-ui/core';
import WithdrawingModal from '@webb-dapp/bridge/components/Withdraw/WithdrawingModal';
import { SpaceBox } from '@webb-dapp/ui-components';
import { InputLabel } from '@webb-dapp/ui-components/Inputs/InputLabel/InputLabel';
import { BridgeNoteInput } from '@webb-dapp/ui-components/Inputs/NoteInput/BridgeNoteInput';
import { Modal } from '@webb-dapp/ui-components/Modal/Modal';
import React, { useState } from 'react';
import styled from 'styled-components';
import { WithdrawState } from '@webb-dapp/react-environment';
import { InputSection } from '@webb-dapp/ui-components/Inputs/InputSection/InputSection';
import { useDepositNote } from '@webb-dapp/mixer';
import { useWithdraw } from '@webb-dapp/bridge/hooks';
import WithdrawSuccessModal from '@webb-dapp/react-components/Withdraw/WithdrawSuccessModal';
import { MixerButton } from '@webb-dapp/ui-components/Buttons/MixerButton';

const WithdrawWrapper = styled.div``;
type WithdrawProps = {};

export const Withdraw: React.FC<WithdrawProps> = () => {
  const [note, setNote] = useState('');
  const [recipient, setRecipient] = useState('');

  const { canCancel, cancelWithdraw, receipt, setReceipt, stage, validationErrors, withdraw } = useWithdraw({
    recipient,
    note,
  });

  const depositNote = useDepositNote(note);
  return (
    <WithdrawWrapper>
      <InputSection>
        <BridgeNoteInput error={note ? validationErrors.note : ''} value={note} onChange={setNote} />
      </InputSection>
      <SpaceBox height={16} />

      <InputSection>
        <InputLabel label={'Recipient'}>
          <InputBase
            value={recipient}
            onChange={(event) => {
              setRecipient(event.target.value as string);
            }}
            inputProps={{ style: { fontSize: 14 } }}
            fullWidth
            placeholder={`Enter account address`}
          />
          <FormHelperText error={Boolean(validationErrors.recipient && recipient)}>
            {validationErrors.recipient}
          </FormHelperText>
        </InputLabel>
      </InputSection>

      <SpaceBox height={16} />

      <MixerButton disabled={!recipient} onClick={withdraw} label={'Withdraw'} />
      <Modal open={stage !== WithdrawState.Ideal}>
        {depositNote && (
          <WithdrawingModal
            withdrawTxInfo={{
              account: recipient,
            }}
            note={depositNote.note}
            cancel={cancelWithdraw}
            stage={stage}
            canCancel={canCancel}
          />
        )}
      </Modal>

      {/* Modal to show on success  */}
      <Modal open={receipt != ''}>
        {depositNote && (
          <WithdrawSuccessModal
            receipt={receipt}
            recipient={recipient}
            note={depositNote.note}
            exit={() => {
              setNote('');
              setRecipient('');
              setReceipt('');
            }}
          />
        )}
      </Modal>
    </WithdrawWrapper>
  );
};
