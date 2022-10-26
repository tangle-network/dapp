import {
  AmountInput,
  Card,
  ChainInput,
  FixedAmount,
  RecipientInput,
  RelayerInput,
  ShieldedAssetInput,
  TitleWithInfo,
  TokenInput,
} from '@nepoche/webb-ui-components';
import { FC, useState } from 'react';

import { ShowcaseProps } from './types';

const values = [0.1, 0.25, 0.5, 1];

export const BridgeInputsShowCase = () => {
  const fixedValue = useState<number | undefined>(values[0]);

  const recipientValue = useState<string | undefined>('');

  return (
    <div className='flex space-x-4'>
      <Showcase fixedAmountState={fixedValue} recipientState={recipientValue} />

      <div className='w-full dark'>
        <Showcase fixedAmountState={fixedValue} recipientState={recipientValue} />
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

        <FixedAmount info='Fix amount' values={values} value={value as number} onChange={(nextVal) => setValue(nextVal)} />

        <RecipientInput value={recipient as string} onChange={(nextVal) => setRecipient(nextVal.toString())} />

        <ShieldedAssetInput />

        <ShieldedAssetInput asset={{ token1Symbol: 'webb', token2Symbol: 'eth', balance: 2.1, balanceInUsd: 1000 }} />

        <RelayerInput />
        <RelayerInput
          relayerAddress='5DJEpHVVxSpaWGfdAzep11MK458y5JkHA5YvYm3dp3eawuXi'
          externalLink='https://webb.tools'
        />
      </div>
    </Card>
  );
};
