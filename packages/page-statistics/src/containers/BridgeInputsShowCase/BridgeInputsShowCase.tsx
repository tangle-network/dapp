import { AmountInput, Card, ChainInput, TitleWithInfo, TokenInput } from '@webb-dapp/webb-ui-components';

export const BridgeInputsShowCase = () => {
  return (
    <div className='flex space-x-4'>
      <Card>
        <TitleWithInfo title='Inputs' variant='h4' />
        <div className='flex flex-col space-y-4'>
          <ChainInput chainType='source' />
          <ChainInput chainType='dest' chain={{ name: 'Optimism', symbol: 'op' }} />

          <TokenInput />
          <TokenInput token={{ symbol: 'eth', balance: 1.2, balanceInUsd: 1000 }} />

          <AmountInput />
          <AmountInput id='Custom amount' info='Custom amount' />
        </div>
      </Card>

      <div className='w-full dark'>
        <Card>
          <TitleWithInfo title='Inputs' variant='h4' />
          <div className='flex flex-col space-y-4'>
            <ChainInput chainType='source' />
            <ChainInput chainType='dest' chain={{ name: 'Optimism', symbol: 'op' }} />

            <TokenInput />
            <TokenInput token={{ symbol: 'eth', balance: 1.2, balanceInUsd: 1000 }} />

            <AmountInput />
            <AmountInput id='Custom amount' info='Custom amount' />
          </div>
        </Card>
      </div>
    </div>
  );
};
