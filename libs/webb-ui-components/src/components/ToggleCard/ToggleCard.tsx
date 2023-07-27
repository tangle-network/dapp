import { getFlexBasic } from '@webb-tools/icons/utils';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { Typography } from '../../typography/Typography';
import { Label } from '../Label';
import { Switcher } from '../Switcher';
import { TitleWithInfo } from '../TitleWithInfo';
import { ToggleCardProps } from './types';

const ToggleCard = forwardRef<HTMLDivElement, ToggleCardProps>(
  (
    { className, Icon, title, id, description, info, switcherProps, ...props },
    ref
  ) => {
    return (
      <div
        className={twMerge(
          'px-4 py-2 rounded-lg bg-[#F7F8F7]/50 hover:bg-mono-20 dark:bg-mono-180 dark:hover:bg-mono-170',
          className
        )}
        ref={ref}
        {...props}
      >
        <div className="flex items-center">
          <div className="flex gap-2 grow">
            {Icon && (
              <span
                className={twMerge(
                  'grow-0 shrink-0',
                  getFlexBasic(Icon.props.size)
                )}
              >
                {Icon}
              </span>
            )}

            <div className="space-y-2">
              <Label id={id ?? title}>
                <TitleWithInfo
                  title={title}
                  variant="utility"
                  info={info}
                  titleComponent="span"
                  className="text-mono-100 dark:text-mono-80"
                  titleClassName="capitalize !text-inherit"
                />
              </Label>

              {description && (
                <Typography variant="body1">{description}</Typography>
              )}
            </div>
          </div>

          <Switcher {...switcherProps} />
        </div>
      </div>
    );
  }
);

export default ToggleCard;
