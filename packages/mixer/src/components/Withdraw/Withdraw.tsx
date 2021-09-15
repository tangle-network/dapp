import { Fade, FormHelperText, InputBase, MenuItem, Select } from '@material-ui/core';
import { MixerButton } from '@webb-dapp/mixer/components/MixerButton/MixerButton';
import WithdrawingModal from '@webb-dapp/mixer/components/Withdraw/WithdrawingModal';
import { useWithdraw } from '@webb-dapp/mixer/hooks';
import { useDepositNote } from '@webb-dapp/mixer/hooks/note';
import { WithdrawState } from '@webb-dapp/react-environment';
import { SpaceBox } from '@webb-dapp/ui-components';
import { InputLabel } from '@webb-dapp/ui-components/Inputs/InputLabel/InputLabel';
import { InputSection } from '@webb-dapp/ui-components/Inputs/InputSection/InputSection';
import { MixerNoteInput } from '@webb-dapp/ui-components/Inputs/NoteInput/MixerNoteInput';
import { Modal } from '@webb-dapp/ui-components/Modal/Modal';
import { Note } from '@webb-tools/sdk-mixer';
import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const WithdrawWrapper = styled.div``;
type WithdrawProps = {};

export const Withdraw: React.FC<WithdrawProps> = () => {
  const [note, setNote] = useState('');

  const [recipient, setRecipient] = useState('');
  const [withdrawPercentage, setWithdrawPercentage] = useState(0);
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
          if (!fees) {
            return;
          }
          setFees(fees.totalFees);
          setWithdrawPercentage(fees.withdrawFeePercentage);
        });
      } catch (e) {
        return;
      }
    }

    getFees();
  }, [note, relayersState.activeRelayer]);

  const depositNote = useDepositNote(note);
  return (
    <WithdrawWrapper>
      <InputSection>
        <MixerNoteInput error={note ? validationErrors.note : ''} value={note} onChange={setNote} />
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
      {depositNote && (
        <>
          <InputSection>
            <InputLabel label={'Relayer'}>
              <Select
                fullWidth
                value={relayersState.activeRelayer?.endpoint || 'none'}
                onChange={({ target: { value } }) => {
                  setRelayer(relayersState?.relayers.find((i) => i.endpoint === value) ?? null);
                }}
              >
                <MenuItem value={'none'} key={'none'}>
                  <p style={{ fontSize: 14 }}>None</p>
                </MenuItem>
                {relayersState.relayers.map((relayer) => {
                  return (
                    <MenuItem value={relayer.endpoint} key={relayer.endpoint}>
                      <p style={{ fontSize: 14 }}>{relayer.endpoint}</p>
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
                          <span style={{ whiteSpace: 'nowrap' }}>Withdraw fee percentage</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>{withdrawPercentage * 100}%</td>
                      </tr>

                      {fees && (
                        <tr>
                          <td>Full fees</td>
                          <td style={{ textAlign: 'right' }}>
                            {ethers.utils.formatUnits(fees)} {depositNote && depositNote.note.tokenSymbol}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Fade>
            </InputLabel>
          </InputSection>
          <SpaceBox height={16} />
        </>
      )}

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
    </WithdrawWrapper>
  );
};
