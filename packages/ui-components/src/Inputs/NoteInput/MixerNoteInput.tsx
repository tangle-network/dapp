import { FormHelperText, Icon, InputBase } from '@material-ui/core';
import { chainNameFromInternalId, getChainNameFromChainId, getEVMChainName, getEVMChainNameFromInternal, parseChainIdType } from '@webb-dapp/apps/configs';
import { bufferToFixed } from '@webb-dapp/contracts/utils/buffer-to-fixed';
import { useDepositNote } from '@webb-dapp/mixer/hooks/note';
import { useWebContext } from '@webb-dapp/react-environment/webb-context';
import { InputLabel } from '@webb-dapp/ui-components/Inputs/InputLabel/InputLabel';
import { notificationApi } from '@webb-dapp/ui-components/notification';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { css } from 'styled-components';

type NoteInputProps = {
  value: string;
  onChange(next: string): void;
  error?: string;
};
const NoteDetails = styled.div`
  ${({ theme }: { theme: Pallet }) => css`
    border-top: 2px solid ${theme.borderColor2};
  `};
  padding: 11px;
  margin: 0 -11px;
`;

export const MixerNoteInput: React.FC<NoteInputProps> = ({ error, onChange, value }) => {
  const depositNote = useDepositNote(value);
  const navigate = useNavigate();
  const { registerInteractiveFeedback } = useWebContext();

  // Switch to bridge tab if note is for bridge
  useEffect(() => {
    if (depositNote && depositNote.note.protocol === 'anchor') {
      notificationApi.addToQueue({
        secondaryMessage: 'Please complete withdraw through the bridge',
        message: 'Switched to bridge',
        variant: 'warning',
        Icon: <Icon>report_problem</Icon>,
      });
      navigate('/bridge', { replace: true });
    }
  }, [depositNote, navigate]);

  return (
    <InputLabel label={'Note'}>
      <InputBase
        fullWidth
        placeholder={`webb://v2:mixer/020000000438:020000000438/0:0/32f696ed77356ffc0b55bc514d821463d0ddf241e0b9228b024f080542b5052b:0b895f6905aa559ac330ddaafc1afae3580eef4c0ff15ee3f41726ed1da31402/?curve=Bn254&width=5&exp=5&hf=Poseidon&backend=Arkworks&token=WEBB&denom=12&amount=10`}
        multiline={true}
        rows={5}
        value={value}
        inputProps={{ style: { fontSize: 14 } }}
        onChange={(event) => {
          console.log(event.target.value);
          if (event.target.value && event.target.value != '')
            onChange?.(event.target.value as string);
        }}
      />
      {depositNote && (
        <NoteDetails>
          <table
            style={{
              width: '100%',
            }}
          >
            <tbody>
              <tr>
                <td>Context:</td>
                <td style={{ textAlign: 'right' }}>
                  <b>{depositNote.note.protocol.toUpperCase()}</b>
                </td>
              </tr>
              <tr>
                <td>Amount:</td>
                <td style={{ textAlign: 'right' }}>
                  {depositNote.note.amount} <b>{depositNote.note.tokenSymbol}</b>
                </td>
              </tr>
              <tr>
                <td>Chain:</td>
                <td style={{ textAlign: 'right' }}>
                  {getChainNameFromChainId(parseChainIdType(Number(`0x${depositNote.note.targetChainId}`)))}
                </td>
              </tr>
            </tbody>
          </table>
        </NoteDetails>
      )}
      <FormHelperText error={Boolean(error)}>{error}</FormHelperText>
    </InputLabel>
  );
};
