import { Fade, FormHelperText, InputBase, MenuItem, Select } from '@material-ui/core';
import { MixerButton } from '@webb-dapp/mixer/components/MixerButton/MixerButton';
import WithdrawingModal from '@webb-dapp/mixer/components/Withdraw/WithdrawingModal';
import { useWithdraw } from '@webb-dapp/mixer/hooks';
import { WithdrawState } from '@webb-dapp/react-environment';
import { SpaceBox } from '@webb-dapp/ui-components';
import { InputLabel } from '@webb-dapp/ui-components/Inputs/InputLabel/InputLabel';
import { InputSection } from '@webb-dapp/ui-components/Inputs/InputSection/InputSection';
import { NoteInput } from '@webb-dapp/ui-components/Inputs/NoteInput/NoteInput';
import { Modal } from '@webb-dapp/ui-components/Modal/Modal';
import React, { useState } from 'react';
import styled from 'styled-components';

const WithdrawWrapper = styled.div``;
type WithdrawProps = {};

export const Withdraw: React.FC<WithdrawProps> = () => {
  const [note, setNote] = useState('');
  const [recipient, setRecipient] = useState('');

  const { canCancel, cancelWithdraw, relayersState, setRelayer, stage, validationErrors, withdraw } = useWithdraw({
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
            onChange={({ target: { value } }) => {
              setRelayer(relayersState?.relayers.find((i) => i.address === value) ?? null);
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
          <Fade in={Boolean(relayersState.activeRelayer)} unmountOnExit mountOnEnter timeout={300}>
            <div
              style={{
                padding: 10,
              }}
            >
              <table
                style={{
                  width: '100%',
                }}
              >
                <tbody>
                  <tr>
                    <td>
                      <span style={{ whiteSpace: 'nowrap' }}>withdraw fee</span>
                    </td>
                    <td>{relayersState.activeRelayer?.fee}</td>
                  </tr>
                  <tr>
                    <td>gas limit</td>
                    <td>{relayersState.activeRelayer?.gasLimit}</td>
                  </tr>
                  <tr>
                    <td>Account</td>
                    <td>
                      <small>{relayersState.activeRelayer?.account}</small>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Fade>
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
