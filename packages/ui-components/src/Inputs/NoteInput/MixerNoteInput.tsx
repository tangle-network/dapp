import { FormHelperText, Icon, InputBase } from '@mui/material';
import { ChainType, parseChainIdType } from '@webb-dapp/api-providers';
import { useDepositNote } from '@webb-dapp/mixer/hooks/note';
import { useWebContext } from '@webb-dapp/react-environment/webb-context';
import { notificationApi } from '@webb-dapp/ui-components/notification';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

type NoteInputProps = {
  value: string;
  onChange(next: string): void;
  error?: string;
};

export const MixerNoteInput: React.FC<NoteInputProps> = ({ error, onChange, value }) => {
  const depositNote = useDepositNote(value);
  const { activeApi } = useWebContext();
  const navigate = useNavigate();

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
          if (event.target.value && event.target.value != '') {
            onChange?.(event.target.value as string);
          }
        }}
      />
      <FormHelperText error={Boolean(error)}>{error}</FormHelperText>
    </>
  );
};
