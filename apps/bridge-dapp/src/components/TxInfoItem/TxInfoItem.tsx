import { CornerDownRightLine } from '@webb-tools/icons/CornerDownRightLine';
import { TitleWithInfo, Typography } from '@webb-tools/webb-ui-components';
import { cloneElement, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { TxInfoItemProps } from './types';

const TxInfoItem = forwardRef<React.ElementRef<'div'>, TxInfoItemProps>(
  ({ leftContent, rightIcon, rightText, className, ...props }, ref) => {
    return (
      <div
        {...props}
        ref={ref}
        className={twMerge(
          'px-2 flex items-center justify-between !text-mono-100',
          className
        )}
      >
        <div className="flex items-center gap-0.5 !text-current">
          <CornerDownRightLine className="!fill-current" />

          <TitleWithInfo
            {...leftContent}
            className={twMerge('!text-inherit', leftContent?.className)}
            titleClassName={twMerge(
              'text-mono-100 dark:text-mono-100',
              leftContent?.titleClassName
            )}
          />
        </div>

        <div className="flex items-center gap-1 !text-current">
          {rightIcon &&
            cloneElement(rightIcon, {
              ...rightIcon.props,
              className: twMerge('!fill-current', rightIcon.props.className),
            })}

          {rightText && (
            <Typography variant="body1" fw="bold" className="!text-current">
              {rightText}
            </Typography>
          )}
        </div>
      </div>
    );
  }
);

export default TxInfoItem;
