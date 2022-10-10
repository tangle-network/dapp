import {
  AmountInput,
  Card,
  ChainInput,
  FixedAmount,
  RecipientInput,
  ShieldedAssetInput,
  TitleWithInfo,
  TokenInput,
} from '@webb-dapp/webb-ui-components';
import { FC, useState } from 'react';

import { ShowcaseProps } from './types';

const values = [0.1, 0.25, 0.5, 1];

export const BridgeInputsShowCase = () => {
  const fixedValue = useState<number | undefined>(values[0]);

  const recipinentValue = useState<string | undefined>('');

  return (
    <div className='flex space-x-4'>
      <Showcase fixedAmountState={fixedValue} recipientState={recipinentValue} />

      <div className='w-full dark'>
        <Showcase fixedAmountState={fixedValue} recipientState={recipinentValue} />
      </div>
    </div>
  );
};

const Showcase: FC<ShowcaseProps> = ({ fixedAmountState, recipientState }) => {
  const [value, setValue] = fixedAmountState;
  const [recipient, setRecipient] = recipientState;

  return (
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

        <ShieldedAssetInput />

        <ShieldedAssetInput asset={{ token1Symbol: 'webb', token2Symbol: 'eth', balance: 2.1, balanceInUsd: 1000 }} />
      </div>
    </Card>
  );
};
