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
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { EvmNote } from '@webb-dapp/contracts/utils/evm-note';

const WithdrawWrapper = styled.div``;
type WithdrawProps = {};

export const Withdraw: React.FC<WithdrawProps> = () => {
  const [note, setNote] = useState('');
  const [recipient, setRecipient] = useState('');
  const [fees, setFees] = useState('');
  const { canCancel, cancelWithdraw, relayersState, setRelayer, stage, validationErrors, withdraw } = useWithdraw({
    recipient,
    note,
  });
  useEffect(() => {
    async function getFees() {
      try {
        if (!relayersState.activeRelayer) {
          return;
        }
        relayersState.activeRelayer.fees(note).then((fees) => {
          setFees(fees);
        });
      } catch (e) {
        return;
      }
    }
    getFees();
  }, [note, relayersState.activeRelayer]);
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
                      <span style={{ whiteSpace: 'nowrap' }}>withdraw fee percentage</span>
                    </td>
                    <td>{relayersState.activeRelayer?.fee}%</td>
                  </tr>
                  <tr>
                    <td>Account</td>
                    <td>
                      <small>{relayersState.activeRelayer?.account}</small>
                    </td>
                  </tr>
                  <tr>
                    <td>Full fees</td>
                    <td>
                      <small>{fees}</small>
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
