import OptimismLogo from '@webb-dapp/apps/configs/logos/chains/OptimismLogo';
import PolygonLogo from '@webb-dapp/apps/configs/logos/chains/PolygonLogo';
import { Button, Chip } from '@webb-dapp/webb-ui-components';
import { Disclaimer } from '@webb-dapp/webb-ui-components/components/Disclaimer/Disclaimer';
import { ArrowRight, TokenIcon } from '@webb-dapp/webb-ui-components/icons';
import { Typography } from '@webb-dapp/webb-ui-components/typography';
import { forwardRef, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { BridgeLabel, TransactionCardItemProps } from './types';

type Variant = 'bridge' | 'native';
/**
 *
 * TransactionProgressCard
 * */

import * as Toast from '@radix-ui/react-toast';

export const TransactionProgressCard = forwardRef<HTMLDivElement, TransactionCardItemProps>(
  ({ className, label, method, ...props }, ref) => {
    const labelVariant = useMemo<Variant>(() => ((label as BridgeLabel).tokenURI ? 'bridge' : 'native'), [label]);
    const [open, setOpen] = useState(true);
    return (
      <Toast.Provider swipeDirection='right'>
        <Toast.Root
          duration={2000}
          type={'foreground'}
          open={open}
          onOpenChange={(o) => {
            console.log('re open');
          }}
        >
          <div
            className={twMerge(
              `rounded-b-lg shadow-xl py-2  px-4 border-t-2 border-mono-80
       flex flex-col space-y-3 max-w-[295px] dark:bg-mono-160`,
              className
            )}
            {...props}
            ref={ref}
          >
            {/*Card Header*/}
            <div className={'my-0 flex items-center'}>
              <div className={'basis-full'}>
                <Chip>{method}</Chip>
              </div>
              <Typography fw={'bold'} variant={'body3'} className={'whitespace-nowrap'}>
                JUST NOW
              </Typography>
            </div>
            {/*Card Content*/}
            <div className={'m-0 flex items-center'}>
              <div className={'h-full self-start py-2'}>
                <TokenIcon size={'lg'} name={'ETH'} />
              </div>
              <div className={'px-2'}>
                <Typography variant={'h5'} fw={'bold'} className={'py-0 text-mono-200'}>
                  0.990
                </Typography>
                <Typography variant={'body4'} fw={'bold'} className={'py-0 text-mono-100'}>
                  1789.12 USD
                </Typography>
              </div>
              <div className={'h-full self-start  flex items-end grow  flex flex-col '}>
                <Button variant={'link'} size={'sm'}>
                  SYNC NOTE
                </Button>

                <div className='flex items-center mt-1'>
                  <div
                    className={`w-5  h-5 rounded-full flex items-center justify-center`}
                    children={<PolygonLogo />}
                  />
                  <div className='px-2'>
                    <ArrowRight />
                  </div>
                  <div
                    className={`w-5  h-5 rounded-full flex items-center justify-center`}
                    children={<OptimismLogo />}
                  />
                </div>
              </div>
            </div>
            {/*Card Info or Disclaimer*/}
            <Disclaimer
              variant={'info'}
              message={'New spend note is added to your account to reflect updated balance on Webb.'}
            />
            {/*Card Footer*/}
            <div className={'my-0 flex items-center'}>
              <div>
                <Typography variant={'body4'} fw={'bold'} className={'py-0 text-mono-100'}>
                  <span className={'inline-block pr-2'}>🎉</span>Successfully Deposited!
                </Typography>
              </div>
              <div className={'flex grow justify-end'}>
                <Button
                  onClick={() => {
                    setOpen(false);
                    setTimeout(() => setOpen(true), 1000);
                  }}
                  variant={'link'}
                  size={'sm'}
                >
                  DISMISS
                </Button>
              </div>
            </div>
          </div>
        </Toast.Root>
        <Toast.Viewport
          style={{
            position: 'fixed',
            bottom: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            padding: '2rem',
            gap: 10,
            width: 390,
            maxWidth: '100vw',
            margin: 0,
            listStyle: 'none',
            zIndex: 2147483647,
            outline: 'none',
          }}
        />
      </Toast.Provider>
    );
  }
);
