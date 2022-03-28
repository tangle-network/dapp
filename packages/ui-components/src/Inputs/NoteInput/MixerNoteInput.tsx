import { FormHelperText, Icon, InputBase } from '@material-ui/core';
import { getChainNameFromChainId, parseChainIdType } from '@webb-dapp/apps/configs';
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
    <>
      <InputBase
        fullWidth
        placeholder={`Please paste your note here`}
        value={value}
        inputProps={{ style: { fontSize: 14 } }}
        onChange={(event) => {
          console.log(event.target.value);
          if (event.target.value && event.target.value != '') {
            onChange?.(event.target.value as string);
          }
        }}
      />
      <FormHelperText error={Boolean(error)}>{error}</FormHelperText>
    </>
  );
};
