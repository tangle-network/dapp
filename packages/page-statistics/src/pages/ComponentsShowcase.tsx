import { Card, Switcher, TitleWithInfo, TokenSelector } from '@webb-dapp/webb-ui-components/components';
import { Typography } from '@webb-dapp/webb-ui-components/typography';

const ComponentsShowcase = () => {
  return (
    <div className='flex flex-col space-y-4'>
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
    </div>
  );
};

export default ComponentsShowcase;
