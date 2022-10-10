import {
  AmountInput,
  Card,
  ChainInput,
  FixedAmount,
  RecipientInput,
  TitleWithInfo,
  TokenInput,
} from '@webb-dapp/webb-ui-components';
import { useState } from 'react';

const values = [0.1, 0.25, 0.5, 1];

export const BridgeInputsShowCase = () => {
  const [value, setValue] = useState(values[0]);

  const [recipient, setRecipient] = useState('');

  return (
    <div className='flex space-x-4'>
      <Card>
        <TitleWithInfo title='Inputs' variant='h4' />
        <div className='flex flex-col items-center space-y-4'>
          <ChainInput chainType='source' />
          <ChainInput chainType='dest' chain={{ name: 'Optimism', symbol: 'op' }} />

          <TokenInput />
          <TokenInput token={{ symbol: 'eth', balance: 1.2, balanceInUsd: 1000 }} />

          <AmountInput />
          <AmountInput id='Custom amount' info='Custom amount' />

          <FixedAmount info='Fix amount' values={values} value={value} onChange={(nextVal) => setValue(nextVal)} />

          <RecipientInput value={recipient} onChange={(nextVal) => setRecipient(nextVal.toString())} />
        </div>
      </Card>

      <div className='w-full dark'>
        <Card>
          <TitleWithInfo title='Inputs' variant='h4' />
          <div className='flex flex-col items-center space-y-4'>
            <ChainInput chainType='source' />
            <ChainInput chainType='dest' chain={{ name: 'Optimism', symbol: 'op' }} />

            <TokenInput />
            <TokenInput token={{ symbol: 'eth', balance: 1.2, balanceInUsd: 1000 }} />

            <AmountInput />
            <AmountInput id='Custom amount' info='Custom amount' />

            <FixedAmount info='Fix amount' values={values} value={value} onChange={(nextVal) => setValue(nextVal)} />

            <RecipientInput value={recipient} onChange={(nextVal) => setRecipient(nextVal.toString())} />
          </div>
        </Card>
      </div>
    </div>
  );
};
