import { Button, Chip } from '@webb-dapp/webb-ui-components';
import { Disclaimer } from '@webb-dapp/webb-ui-components/components/Disclaimer/Disclaimer';
import { ArrowRight, ExternalLinkLine, Spinner, TokenIcon, ChevronUp } from '@webb-dapp/webb-ui-components/icons';
import { Typography } from '@webb-dapp/webb-ui-components/typography';
import { FC, forwardRef, useCallback, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { BridgeLabel, TransactionCardItemProps, TXCardFooterProps } from './types';
import { ChipColors } from '@webb-dapp/webb-ui-components/components/Chip/types';

type Variant = 'bridge' | 'native';
const sectionPadding = 'py-2  px-4 m-0 mt-0';

/**
 *
 * TransactionProgressCard
 * */
export const TransactionProgressCard = forwardRef<HTMLDivElement, TransactionCardItemProps>(
  ({ className, label, method, wallets, onDismiss, onDetails, ...props }, ref) => {
    const labelVariant = useMemo<Variant>(() => ((label as BridgeLabel).tokenURI ? 'bridge' : 'native'), [label]);
    const [open, setOpen] = useState(true);
    const chipColor = useMemo<ChipColors>((): ChipColors => {
      switch (method) {
        case 'Withdraw':
          return 'purple';
        case 'Deposit':
          return 'yellow';
        case 'Transfer':
          return 'green';
      }
      return 'red';
    }, [method]);

    const hasSyncNote = useMemo(() => {
      return method === 'Withdraw';
    }, [method]);

    return (
      <div
        className={twMerge(
          `border-t border-mono-80 dark:border-mono-120
            flex flex-col  dark:bg-mono-160`,
          className
        )}
        {...props}
        ref={ref}
      >
        {/*Card Header*/}
        <div className={twMerge('my-0 flex items-center', sectionPadding)}>
          <div className={'basis-full'}>
            <Chip color={chipColor}>{method}</Chip>
          </div>
          <Typography fw={'bold'} variant={'body3'} className={'whitespace-nowrap'}>
            JUST NOW
          </Typography>
        </div>
        {/*Card Content*/}
        <div className={twMerge('my-0 flex items-center', sectionPadding)}>
          <div className={'h-full self-start'}>
            <TokenIcon size={'lg'} name={'ETH'} />
          </div>
          <div className={'px-2'}>
            <Typography variant={'h5'} fw={'bold'} className={'py-0 text-mono-200'}>
              {label.amount}
            </Typography>
            {labelVariant === 'native' ? (
              <Typography variant={'body4'} fw={'bold'} className={'py-0 text-mono-100'}>
                {label.nativeValue!} USD
              </Typography>
            ) : (
              <Typography variant={'body4'} fw={'bold'} className='py-0 text-mono-200'>
                {label.token!} <ExternalLinkLine className='!fill-current inline whitespace-nowrap' />
              </Typography>
            )}
          </div>
          <div className={'h-full self-start  flex items-end grow  flex flex-col '}>
            {hasSyncNote && (
              <Button variant={'link'} size={'sm'}>
                SYNC NOTE
              </Button>
            )}

            <div className='flex items-center mt-1'>
              <div className={`w-5  h-5 rounded-full flex items-center justify-center`} children={wallets.src} />
              <div className='px-2'>
                <ArrowRight />
              </div>
              <div className={`w-5  h-5 rounded-full flex items-center justify-center`} children={wallets.dist} />
            </div>
          </div>
        </div>
        {/*Card Info or Disclaimer*/}
        {hasSyncNote && (
          <div className={sectionPadding}>
            <Disclaimer
              variant={'info'}
              message={'New spend note is added to your account to reflect updated balance on Webb.'}
            />
          </div>
        )}
        {/*Card Footer*/}
        <TXCardFooter {...props.footer} onDismiss={onDismiss} onDetails={onDetails} />
      </div>
    );
  }
);

const TXCardFooter: FC<TXCardFooterProps & Pick<TransactionCardItemProps, 'onDismiss' | 'onDetails'>> = ({
  isLoading,
  message,
  link,
  hasWarning,
  onDetails,
  onDismiss,
}) => {
  const textClass = useMemo(
    () => `py-0 align-middle ${hasWarning ? 'text-yellow-100 dark:text-yellow-50' : 'text-mono-100'}`,
    [hasWarning]
  );
  const wrapperClasses = useMemo(() => {
    const classes = hasWarning
      ? `my-0 p-4 flex items-center bg-yellow-70 border-t-2 border-yellow-90 dark:bg-yellow-120`
      : 'my-0 flex items-center p-4';
    return twMerge(classes);
  }, [hasWarning]);

  const showDetails = Boolean(onDetails) && isLoading;
  const buttonHandler = useCallback(() => {
    return showDetails ? onDetails?.() : onDismiss();
  }, [showDetails]);
  return (
    <div className={wrapperClasses}>
      <div className='flex items-center'>
        {isLoading && !hasWarning && (
          <div className='pr-2'>
            <Spinner />
          </div>
        )}

        {message && (
          <Typography variant={'body4'} fw={'bold'} className={textClass}>
            {message}
          </Typography>
        )}
        {link && (
          <Typography variant={'body4'} fw={'bold'} className={twMerge(textClass, 'flex items-center')}>
            {link.text}
          </Typography>
        )}
      </div>
      <div className={'flex grow justify-end'}>
        <Button onClick={buttonHandler} variant={'link'} size={'sm'} className={hasWarning ? textClass : undefined}>
          {showDetails ? 'DETAILS' : 'DISMISS'}
        </Button>
      </div>
    </div>
  );
};

export const TransactionsToggler: React.FC = ({ children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`rounded-lg shadow-xl  overflow-hidden
            flex flex-col  max-w-[295px] dark:bg-mono-160`}
    >
      <div className='flex row items-center    p-3'>
        <div className={'pr-4'}>
          <Spinner width={18} height={18} />
        </div>

        <div className={'grow'}>
          <Typography variant={'body2'} fw={'bold'} className={' text-mono-180 dark:text-mono'}>
            Transaction Processing
          </Typography>
          <Typography variant={'body4'} className={'text-mono-120 dark:text-mono-80'}>
            1 transaction in progress
          </Typography>
        </div>
        <b>
          <div
            style={{
              transition: 'transform .33s ease',
              transform: open ? 'rotate(180deg)' : 'rotate(0)',
            }}
            role={'button'}
            className={'w-4 h-4'}
            onClick={() => setOpen((o) => !o)}
          >
            <ChevronUp />
          </div>
        </b>
      </div>
      <div className={'max-h-96 overflow-auto'}>{open && children}</div>
    </div>
  );
};
