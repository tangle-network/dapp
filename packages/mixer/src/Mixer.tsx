import { Deposit, Withdraw } from '@webb-dapp/mixer/components';
import { MixerTabs } from '@webb-dapp/ui-components/Tabs/MixerTabs';
import { CheckBox } from '@webb-dapp/webb-ui-components';
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
      </div>
    </MixerWrapper>
  );
};
