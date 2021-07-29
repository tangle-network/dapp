import { FormHelperText, InputBase, MenuItem, Select } from '@material-ui/core';
import { MixerButton } from '@webb-dapp/mixer/components/MixerButton/MixerButton';
import WithdrawingModal from '@webb-dapp/mixer/components/Withdraw/WithdrawingModal';
import { useWithdraw } from '@webb-dapp/mixer/hooks';
import { SpaceBox } from '@webb-dapp/ui-components';
import { InputLabel } from '@webb-dapp/ui-components/Inputs/InputLabel/InputLabel';
import { NoteInput } from '@webb-dapp/ui-components/Inputs/NoteInput/NoteInput';
import { Modal } from '@webb-dapp/ui-components/Modal/Modal';
import React, { useState } from 'react';
import styled from 'styled-components';
import { WithdrawState } from '@webb-dapp/react-environment';
import { InputSection } from '@webb-dapp/ui-components/Inputs/InputSection/InputSection';

const WithdrawWrapper = styled.div``;
type WithdrawProps = {};

export const Withdraw: React.FC<WithdrawProps> = () => {
  const [note, setNote] = useState('');
  const [recipient, setRecipient] = useState('');

  const { canCancel, cancelWithdraw, stage, validationErrors, withdraw, setRelayer, relayersState } = useWithdraw({
    recipient,
    note,
  });
  return (
    <WithdrawWrapper>
      <InputSection>
        <NoteInput error={note ? validationErrors.note : ''} value={note} onChange={setNote} />
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
      <InputSection>
        <InputLabel label={'Relayer'}>
          <Select
            fullWidth
            value={relayersState.activeRelayer?.address}
            onChange={(ad) => {
              setRelayer(relayersState?.relayers.find((i) => i.address === ad) ?? null);
            }}
          >
            {relayersState.relayers.map((relayer) => {
              return (
                <MenuItem value={relayer.address} key={relayer.address}>
                  {relayer.address}
                </MenuItem>
              );
            })}
          </Select>
        </InputLabel>
      </InputSection>
      <SpaceBox height={16} />

      <MixerButton disabled={!recipient} onClick={withdraw} label={'Withdraw'} />
      <Modal open={stage !== WithdrawState.Ideal}>
        <WithdrawingModal
          withdrawTxInfo={{
            account: recipient,
          }}
          cancel={cancelWithdraw}
          stage={stage}
          canCancel={canCancel}
        />
      </Modal>
    </WithdrawWrapper>
  );
};
