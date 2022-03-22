import { FormHelperText, Icon, InputBase } from '@material-ui/core';
import { useBridge } from '@webb-dapp/bridge/hooks/bridge/use-bridge';
import { useDepositNote } from '@webb-dapp/mixer/hooks/note';
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

export const BridgeNoteInput: React.FC<NoteInputProps> = ({ error, onChange, value }) => {
  const depositNote = useDepositNote(value);
  const navigate = useNavigate();

  // Switch to mixer tab if note is for mixer
  useEffect(() => {
    if (depositNote && depositNote.note.protocol === 'mixer') {
      notificationApi.addToQueue({
        secondaryMessage: 'Please complete withdraw through the mixer',
        message: 'Switched to mixer',
        variant: 'warning',
        Icon: <Icon>report_problem</Icon>,
      });
      navigate('/mixer', { replace: true });
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
          onChange?.(event.target.value as string);
        }}
      />
      <FormHelperText error={Boolean(error)}>{error}</FormHelperText>
    </>
  );
};
