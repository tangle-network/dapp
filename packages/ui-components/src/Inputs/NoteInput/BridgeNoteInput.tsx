import { FormHelperText, Icon, InputBase } from '@material-ui/core';
import { webbCurrencyIdFromString } from '@webb-dapp/api-providers';
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

export const BridgeNoteInput: React.FC<NoteInputProps> = ({ error, onChange, value }) => {
  const depositNote = useDepositNote(value);
  const navigate = useNavigate();
  const { activeApi } = useWebContext();
  const anchorApi = activeApi?.methods.anchorApi;

  // Side effects on note input
  useEffect(() => {
    // Switch to mixer if note is for the mixer
    if (depositNote && depositNote.note.protocol === 'mixer') {
      notificationApi.addToQueue({
        secondaryMessage: 'Please complete withdraw through the mixer',
        message: 'Switched to mixer',
        variant: 'warning',
        Icon: <Icon>report_problem</Icon>,
      });
      navigate('/mixer', { replace: true });
    }
    if (depositNote) {
      // Set the appropriate active bridge
      const bridgedCurrency = webbCurrencyIdFromString(depositNote.note.tokenSymbol);

      if (anchorApi && anchorApi.bridgeIds.includes(bridgedCurrency.toString())) {
        anchorApi.setActiveBridge(anchorApi.store.config[bridgedCurrency]);
      }
    }
  }, [anchorApi, depositNote, navigate]);

  return (
    <>
      <InputBase
        fullWidth
        placeholder={`Note`}
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
