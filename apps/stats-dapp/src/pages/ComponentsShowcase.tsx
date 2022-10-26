import { Card, Switcher, TitleWithInfo, TokenSelector } from '@nepoche/webb-ui-components/components';
import { Typography } from '@nepoche/webb-ui-components/typography';

import { BridgeInputsShowCase, ListCardsShowcase } from '../containers';

const ComponentsShowcase = () => {
  return (
    <div className='flex flex-col space-y-4'>
      {/** Switcher */}
      <div className='flex space-x-4'>
        <Card>
          <TitleWithInfo title='Switcher' variant='h4' />

          <div className='flex items-center justify-between max-w-[112px]'>
            <Typography variant='body1' fw='bold'>
              Default:
            </Typography>
            <Switcher />
          </div>

          <div className='flex items-center justify-between max-w-[112px]'>
            <Typography variant='body1' fw='bold'>
              Checked:
            </Typography>
            <Switcher defaultChecked />
          </div>

          <div className='flex items-center justify-between max-w-[112px]'>
            <Typography variant='body1' fw='bold'>
              Disabled:
            </Typography>
            <Switcher disabled />
          </div>
        </Card>

        <div className='w-full dark'>
          <Card>
            <TitleWithInfo title='Switcher' variant='h4' />
            <div className='flex items-center justify-between max-w-[112px]'>
              <Typography variant='body1' fw='bold'>
                Default:
              </Typography>
              <Switcher />
            </div>
            <div className='flex items-center justify-between max-w-[112px]'>
              <Typography variant='body1' fw='bold'>
                Checked:
              </Typography>
              <Switcher defaultChecked />
            </div>
            <div className='flex items-center justify-between max-w-[112px]'>
              <Typography variant='body1' fw='bold'>
                Disabled:
              </Typography>
              <Switcher disabled />
            </div>
          </Card>
        </div>
      </div>

      {/** Token Selector */}
      <div className='flex space-x-4'>
        <Card>
          <TitleWithInfo title='Token Selector' variant='h4' />
          <div className='flex items-center space-x-4'>
            <TokenSelector>ETH</TokenSelector>
            <TokenSelector>DOT</TokenSelector>
            <TokenSelector isActive>KSM</TokenSelector>
          </div>
        </Card>

        <div className='w-full dark'>
          <Card>
            <TitleWithInfo title='Token Selector' variant='h4' />
            <div className='flex items-center space-x-4'>
              <TokenSelector>ETH</TokenSelector>
              <TokenSelector>DOT</TokenSelector>
              <TokenSelector isActive>KSM</TokenSelector>
            </div>
          </Card>
        </div>
      </div>

      {/** Inputs */}
      <BridgeInputsShowCase />

      {/** List cards */}
      <ListCardsShowcase />
    </div>
  );
};

export default ComponentsShowcase;
