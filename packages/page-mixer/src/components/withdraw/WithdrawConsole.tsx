import { Fab, TextField } from '@material-ui/core';
import { useWithdraw } from '@webb-dapp/react-hooks/withdraw/useWithdraw';
import { SpaceBox } from '@webb-dapp/ui-components';
import React, { FC, useState } from 'react';

import { CardRoot, CardTitle } from '../common';

export const WithdrawConsole: FC = () => {
  const [note, setNote] = useState('');

  const { withdraw } = useWithdraw(note);
  return (
    <CardRoot>
      <CardTitle>Withdraw</CardTitle>
      <TextField fullWidth label={'note'} value={note} onChange={({ target: { value } }) => setNote(value)} />
      <SpaceBox height={24} />
      <Fab onClick={withdraw} variant={'extended'} color='primary'>
        Withdraw
      </Fab>
    </CardRoot>
  );
};
