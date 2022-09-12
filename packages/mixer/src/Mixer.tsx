import { randEthereumAddress, randRecentDate } from '@ngneat/falso';
import { Deposit, Withdraw } from '@webb-dapp/mixer/components';
import { MixerTabs } from '@webb-dapp/ui-components/Tabs/MixerTabs';
import {
  Button,
  CheckBox,
  Chip,
  DropdownMenu,
  Input,
  KeyCard,
  KeyStatusCard,
  KeyValueWithButton,
  NetworkThresholdsCard,
  Progress,
  Slider,
  TimeLine,
  TimeLineItem,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
  useKeyStatusSeedData,
  useNetworkThresholdsSeedData,
} from '@webb-dapp/webb-ui-components';
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

  const [sliderVal, setSliderVal] = useState([12, 24]);

  const statusCardData = useKeyStatusSeedData();
  const networkThresholdsData = useNetworkThresholdsSeedData();

  return (
    <MixerWrapper>
      <MixerTabs Withdraw={<Withdraw />} Deposit={<Deposit />} />

      <div className='mt-6 ml-3'>
        <TimeLine>
          <TimeLineItem
            title='Proposed'
            time={randRecentDate()}
            txHash={randEthereumAddress()}
            externalUrl='https://webb.tools'
          />

          <TimeLineItem
            title='Accepted'
            time={randRecentDate()}
            txHash={randEthereumAddress()}
            externalUrl='https://webb.tools'
            extraContent={
              <div className='flex items-center space-x-2'>
                <KeyValueWithButton
                  labelVariant='body3'
                  keyValue={randEthereumAddress()}
                  size='sm'
                  className='inline-block'
                />
                <Button varirant='link' size='sm' className='uppercase'>
                  Details
                </Button>
              </div>
            }
          />

          <TimeLineItem
            title='Signing'
            time={new Date()}
            txHash={randEthereumAddress()}
            externalUrl='https://webb.tools'
            isLoading
            extraContent={
              <div className='flex items-center space-x-2'>
                <KeyValueWithButton
                  labelVariant='body3'
                  keyValue={randEthereumAddress()}
                  size='sm'
                  className='inline-block'
                />
                <Chip color='green' className='uppercase'>
                  Active
                </Chip>
                <Button varirant='link' size='sm' className='uppercase'>
                  Details
                </Button>
              </div>
            }
          />
        </TimeLine>
      </div>

      <div className='flex mt-6 justify-evenly'>
        <KeyCard
          title='Uncompressed Key:'
          keyValue='0x6d513cf4e5f0e605a6584322382bd5896d4f0dfdd1e9a7921287d116022e85df468c095cef8e9b7ac8b6f01e5b46b33c39b21287d116022e85d'
        />

        <KeyCard title='Compressed Key:' keyValue='0x026d513cf4e5f0e605a6584322382bd5896d4f0dfdd1e9a7' />
      </div>

      <NetworkThresholdsCard {...networkThresholdsData} className='max-w-[1376px] mt-6' />

      <KeyStatusCard className='max-w-[680px] mt-6' {...statusCardData} />

      <div className='mt-8'>
        <Button varirant='link' isDisabled size='sm'>
          Button
        </Button>
      </div>

      <div className='mt-8'>
        <Chip color='green' isDisabled>
          Green
        </Chip>
        <Chip color='blue' isDisabled className='inline-block ml-2'>
          Blue
        </Chip>
        <Chip color='red' isDisabled className='inline-block ml-2'>
          Red
        </Chip>
        <Chip color='purple' isDisabled className='inline-block ml-2'>
          Purple
        </Chip>
        <Chip color='yellow' isDisabled className='inline-block ml-2'>
          Yellow
        </Chip>
      </div>

      <div className='mt-8'>
        <h6 className='mt-5'>Small</h6>
        <Progress size='sm' value={60} className='w-[100px]' />
        <h6 className='mt-5'>Medium (default)</h6>
        <Progress value={60} className='w-[495px]' />
        <h6 className='mt-5'>Large</h6>
        <Progress size='lg' className='w-[666px]' value={60} />
      </div>

      <div className='flex justify-around my-36'>
        <Tooltip isDefaultOpen>
          <TooltipTrigger>
            <Chip color='blue'>Text only</Chip>
          </TooltipTrigger>
          <TooltipBody className='max-w-[185px] w-auto'>
            <span>A report of a DKG authority misbehaving. (Body xs Regular)</span>
          </TooltipBody>
        </Tooltip>

        <Tooltip isDefaultOpen>
          <TooltipTrigger>
            <Chip color='blue'>Title + text</Chip>
          </TooltipTrigger>
          <TooltipBody className='max-w-[185px] w-auto' title='Misbehavior Report (Title)'>
            <span>A report of a DKG authority misbehaving. (Body xs Regular)</span>
          </TooltipBody>
        </Tooltip>

        <Tooltip isDefaultOpen>
          <TooltipTrigger>
            <Chip color='blue'>Title + text + button</Chip>
          </TooltipTrigger>
          <TooltipBody
            className='max-w-[185px] w-auto'
            title='Misbehavior Report (Title)'
            button={
              <Button size='sm' varirant='utility'>
                Learn more
              </Button>
            }
          >
            <span className='inline-block'>A report of a DKG authority misbehaving. (Body xs Regular)</span>
          </TooltipBody>
        </Tooltip>
      </div>
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
      </div>
      <div>
        <Slider className='mt-4' defaultValue={[25]} />
        <Slider className='mt-4' hasLabel defaultValue={[25]} />
        <Slider className='mt-4' value={sliderVal} onChange={setSliderVal} />
        <Slider className='mt-4' hasLabel defaultValue={[25, 75]} />
      </div>
    </MixerWrapper>
  );
};
