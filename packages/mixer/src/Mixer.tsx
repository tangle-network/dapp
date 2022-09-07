import { Deposit, Withdraw } from '@webb-dapp/mixer/components';
import { MixerTabs } from '@webb-dapp/ui-components/Tabs/MixerTabs';
import { CheckBox, DropdownMenu, Input } from '@webb-dapp/webb-ui-components';
import {
  Coin,
  Filter,
  GithubFill,
  Graph,
  Search,
  TelegramFill,
  TwitterFill,
} from '@webb-dapp/webb-ui-components/icons';
import React, { useState } from 'react';
import styled from 'styled-components';

const MixerWrapper = styled.div``;
type MixerProps = {};

const dropdownOptions = [
  { value: 'Github', icon: <GithubFill /> },
  { value: 'Telegram', icon: <TelegramFill /> },
  { value: 'Twitter', icon: <TwitterFill /> },
];

export const Mixer: React.FC<MixerProps> = () => {
  const [value, setValue] = useState<undefined | string>();

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
            isReadOnly
            leftIcon={<Graph className='fill-current dark:fill-current' />}
            className='mt-3'
          />
          <Input id='invalid' isInvalid isReadOnly value='isInvalid' className='mt-3' />
          <Input id='withError' isInvalid isReadOnly value='With Error' errorMessage='Error message' className='mt-3' />
          <Input id='iconLeft' value='Icon left' isReadOnly leftIcon={<Coin size='xl' />} className='mt-3' />
          <Input id='iconRight' value='Icon right' isReadOnly rightIcon={<Search size='xl' />} className='mt-3' />
        </div>
        <div>
          <DropdownMenu className='mr-3' size='sm' label='Filter' icon={<Filter />} menuOptions={dropdownOptions} />

          <DropdownMenu
            label='Brand'
            menuOptions={dropdownOptions}
            value={value}
            onChange={(nextVal) => setValue(nextVal)}
          />
        </div>
      </div>
    </MixerWrapper>
  );
};
