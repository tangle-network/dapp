import { FormHelperText, InputBase } from '@material-ui/core';
import { InputLabel } from '@webb-dapp/ui-components/Inputs/InputLabel/InputLabel';
import React, { useEffect } from 'react';
import styled, { css } from 'styled-components';
import { useDepositNote } from '@webb-dapp/mixer/hooks/note';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import { getEVMChainNameFromInternal } from '@webb-dapp/apps/configs';
import { useWebContext } from '@webb-dapp/react-environment/webb-context';
import { chainsPopulated } from '@webb-dapp/apps/configs';
import { evmChainConflict } from '@webb-dapp/react-environment/error/interactive-errors/evm-network-conflict';
import { appEvent } from '@webb-dapp/react-environment/app-event';

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
  const { activeChain, activeWallet, registerInteractiveFeedback, switchChain } = useWebContext();

  useEffect(() => {
    if (depositNote && activeChain && activeWallet) {
      if (Number(depositNote.note.chain) != activeChain.id) {
        const feedback = evmChainConflict(
          {
            intendedChain: getEVMChainNameFromInternal(Number(depositNote.note.chain)),
            selectedChain: activeChain.name,
            switchChain: () => switchChain(chainsPopulated[Number(depositNote.note.chain)], activeWallet),
          },
          appEvent
        );
        registerInteractiveFeedback(feedback);
      }
    }
  }, [activeChain, depositNote]);

  return (
    <InputLabel label={'Note'}>
      <InputBase
        fullWidth
        placeholder={`webb.mix:v1:4:Circom:Bn254:Poseidon:ETH:18:0.1:5:5:dc92b0096b02746362c56dbee8e28a036f29b600b59cad3e4a114af2e2eb094f9878beaf5699f43d789937130e7ee7ca12e0703ce9cc62297bbb0abc864e`}
        multiline={true}
        rows={5}
        value={value}
        inputProps={{ style: { fontSize: 14 } }}
        onChange={(event) => {
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
                  <b>{depositNote.note.prefix.replace('webb.', '').toUpperCase()}</b>
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
                <td style={{ textAlign: 'right' }}>{getEVMChainNameFromInternal(Number(depositNote.note.chain))}</td>
              </tr>
            </tbody>
          </table>
        </NoteDetails>
      )}
      <FormHelperText error={Boolean(error)}>{error}</FormHelperText>
    </InputLabel>
  );
};
