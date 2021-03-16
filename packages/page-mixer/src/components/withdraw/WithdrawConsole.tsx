import { Button, Fab, MenuItem, TextField, Typography } from '@material-ui/core';
import { useWithdraw } from '@webb-dapp/react-hooks/withdraw/useWithdraw';
import { SpaceBox } from '@webb-dapp/ui-components';
import React, { FC, useState } from 'react';
import styled from 'styled-components';
import { CardRoot, CardTitle } from '../common';

const CallToActionWrapper = styled.div`
  max-width: 300px;
  margin: auto;
`;
export const WithdrawConsole: FC = () => {
  const [note, setNote] = useState('');

  const { accounts, setWithdrawTo, withdraw, withdrawTo } = useWithdraw(note);

  return (
    <CardRoot>
      <CardTitle>Withdraw</CardTitle>
      <TextField
        multiline
        rows={5}
        placeholder={`webb.mix-v1-EDG-2-d6292aab18779001a69c18d41a2649b273770d22f2f098b04c1d49a9b94990017ce9c1c8b9ac7a18773a624dafb4bcb7989e63162abe5a22f753f90e42618b0a`}
        fullWidth
        label={'Note'}
        value={note}
        onChange={({ target: { value } }) => setNote(value)}
      />
      <SpaceBox height={24} />
      <TextField
        label={'Recipient'}
        select
        fullWidth
        value={withdrawTo?.address || ''}
        onChange={({ target: { value } }) => {
          console.log(value);
          setWithdrawTo(accounts.find((acc) => acc.address === value) || null);
        }}
      >
        {accounts.map((account) => (
          <MenuItem key={account.address} value={account.address}>
            <div>
              <div>{account.name}</div>
              <Typography variant={'caption'} color={'textSecondary'}>
                {account.address}
              </Typography>
            </div>
          </MenuItem>
        ))}
      </TextField>
      <SpaceBox height={24} />
      <CallToActionWrapper>
        <Button disabled={!withdrawTo || !note} fullWidth variant='contained' onClick={withdraw} color='primary'>
          Withdrawn
        </Button>
      </CallToActionWrapper>
    </CardRoot>
  );
};
