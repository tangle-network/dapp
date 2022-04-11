import { FormHelperText, Icon, InputBase } from '@material-ui/core';
import { useDepositNote } from '@webb-dapp/mixer/hooks/note';
import { useWebContext } from '@webb-dapp/react-environment/webb-context';
import { notificationApi } from '@webb-dapp/ui-components/notification';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import { ChainType, parseChainIdType } from '@webb-tools/api-providers';
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
  const { activeApi } = useWebContext();
  const navigate = useNavigate();
  const { registerInteractiveFeedback } = useWebContext();

  // Switch to bridge tab if note is for anchor protocol - but the target is not an EVM chain.
  // This is because the EVM mixer uses the same anchor protocol whereas other chain types
  // may require the anchor withdraw flow.
  useEffect(() => {
    if (
      depositNote &&
      depositNote.note.protocol === 'anchor' &&
      parseChainIdType(Number(depositNote.note.targetChainId)).chainType != ChainType.EVM
    ) {
      notificationApi.addToQueue({
        secondaryMessage: 'Please complete withdraw through the bridge',
        message: 'Switched to bridge',
        variant: 'warning',
        Icon: <Icon>report_problem</Icon>,
      });
      navigate('/bridge', { replace: true });
    }
  }, [depositNote, activeApi, navigate]);

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
