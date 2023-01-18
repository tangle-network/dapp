import React, { FC, useCallback } from 'react';
import { TransactionCardItemProps, TransactionCardFooterProps } from './types';
import cx from 'classnames';
import { twMerge } from 'tailwind-merge';
import { ExternalLinkLine, Spinner } from '@webb-tools/icons';
import { Button, Typography } from '@webb-tools/webb-ui-components';
import { ExternalLinkIcon } from '@radix-ui/react-icons';

/**
 *  Transaction card footer
 *  @description An internal component that is used for the `TransactionProcessingCard`
 *
 *  @example Footer for success Transfer Transaction
 *  ```jsx
 *  <TxCardFooter
 *   isLoading={false}
 *   message={ (
              <>
                <span className={'inline-block pr-2'}>🎉</span>Successfully Transfer!
              </>
            )}
 onDetails={() =>{
        window.open(...)
      }
 *  />
 *  ```
 *  @example Footer for failed transaction
 *  <TxCardFooter
 *    hasWarning
 *    link= {{
              uri: '#',
              text: (
                <>
                  <span
                    className={'inline-block pr-2'}
                    style={{
                      fontSize: 18,
                    }}
                  >
                    ⚠️
                  </span>
                  Deposit Failed
                </>
              ),
            }}
 />
 *
 * */
export const TransactionCardFooter: FC<
  TransactionCardFooterProps &
    Pick<TransactionCardItemProps, 'onDismiss' | 'onDetails'>
> = ({ isLoading, message, link, hasWarning, onDetails, onDismiss }) => {
  const textClass = cx(
    'py-0 align-middle',
    { 'text-yellow-100 dark:text-yellow-50': hasWarning },
    { 'text-mono-100': !hasWarning }
  );

  const showDetails = Boolean(onDetails) && (isLoading || hasWarning);
  const buttonHandler = useCallback(() => {
    return showDetails ? onDetails?.() : onDismiss();
  }, [showDetails]);
  return (
    <div
      className={cx('my-0 flex items-center p-4 py-2', {
        'bg-yellow-10 border-t-2 border-yellow-90 dark:bg-yellow-120':
          hasWarning,
      })}
    >
      <div className="flex items-center">
        {isLoading && !hasWarning && (
          <div className="pr-2">
            <Spinner />
          </div>
        )}

        {message && !link && (
          <Typography
            variant={'body3'}
            fw={'bold'}
            className={twMerge(textClass, 'flex items-center')}
          >
            {message}
          </Typography>
        )}
        {link && (
          <a rel="noopener noreferrer" href={link.uri} target="_blank">
            <Typography
              variant={'body3'}
              fw={'bold'}
              className={twMerge(textClass, 'flex items-center')}
            >
              {link.text}
              <ExternalLinkIcon
                width={12}
                height={12}
                className="!fill-current inline whitespace-nowrap ml-1"
              />
            </Typography>
          </a>
        )}
      </div>
      <div className={'flex grow justify-end'}>
        <Button
          onClick={buttonHandler}
          variant={'link'}
          size={'sm'}
          className={hasWarning ? textClass : undefined}
        >
          {showDetails ? 'DETAILS' : 'DISMISS'}
        </Button>
      </div>
    </div>
  );
};
