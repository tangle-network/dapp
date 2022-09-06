import { Deposit, Withdraw } from '@webb-dapp/mixer/components';
import { MixerTabs } from '@webb-dapp/ui-components/Tabs/MixerTabs';
import { CheckBox, Input } from '@webb-dapp/webb-ui-components';
import { Coin, Graph, Search } from '@webb-dapp/webb-ui-components/icons';
import React from 'react';
import styled from 'styled-components';

const MixerWrapper = styled.div``;
type MixerProps = {};

export const Mixer: React.FC<MixerProps> = () => {
  return (
    <MixerWrapper>
      <MixerTabs Withdraw={<Withdraw />} Deposit={<Deposit />} />
      <div className='flex mt-3 space-x-5'>
        <div>
          <CheckBox wrapperClassName='block' />
          <CheckBox wrapperClassName='block' />
          <CheckBox wrapperClassName='block' />
          <CheckBox isDisabled wrapperClassName='block' />
        </div>
        <div>
          <CheckBox wrapperClassName='block'>Check mark</CheckBox>
          <CheckBox wrapperClassName='block'>Check mark</CheckBox>
          <CheckBox wrapperClassName='block'>Check mark</CheckBox>
          <CheckBox isDisabled wrapperClassName='block'>
            Check mark
          </CheckBox>
        </div>
        <div>
          <Input id='default' />
          <Input id='placeholder' placeholder='With placeholder' className='mt-3' />
          <Input id='readonly' value='Readonly' isReadOnly className='mt-3' />
          <Input
            id='disabled'
            isDisabled
            value='isDisabled'
            leftIcon={<Graph className='fill-current dark:fill-current' />}
            className='mt-3'
          />
          <Input id='invalid' isInvalid value='isInvalid' className='mt-3' />
          <Input id='withError' isInvalid value='With Error' errorMessage='Error message' className='mt-3' />
          <Input id='iconLeft' value='Icon left' leftIcon={<Coin size='xl' />} className='mt-3' />
          <Input id='iconRight' value='Icon right' rightIcon={<Search size='xl' />} className='mt-3' />
        </div>
      </div>
    </MixerWrapper>
  );
};
