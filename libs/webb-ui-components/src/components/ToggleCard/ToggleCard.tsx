import { getFlexBasic } from '@webb-tools/icons/utils';
import { cloneElement, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { Typography } from '../../typography/Typography';
import { Label } from '../Label';
import { Switcher } from '../Switcher';
import { TitleWithInfo } from '../TitleWithInfo';
import { ToggleCardProps } from './types';

/**
 * ToggleCard is a component that displays a title, description, and a switcher.
 *
 * Props:
 * - className: Override the default styles.
 * - Icon: The icon to display on the left side of the card.
 * - title: The title of the card.
 * - id: The id of the card.
 * - description: The description of the card.
 * - info: The info of the card.
 * - switcherProps: The props of the switcher.
 */
const ToggleCard = forwardRef<HTMLDivElement, ToggleCardProps>(
  (
    { className, Icon, title, id, description, info, switcherProps, ...props },
    ref,
  ) => {
    return (
      <div
        className={twMerge(
          'px-4 py-2 rounded-lg max-w-md',
          'bg-[#F7F8F7]/50 hover:bg-mono-20',
          'dark:bg-mono-180 dark:hover:bg-mono-170',
          className,
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
                  getFlexBasic(Icon.props.size),
                )}
              >
                {cloneElement(Icon, {
                  ...Icon.props,
                  className: twMerge(Icon.props.className, '!fill-mono-100'),
                })}
              </span>
            )}

            <div className="space-y-2">
              <Label id={id ?? title}>
                <TitleWithInfo
                  title={title}
                  variant="body1"
                  info={info}
                  titleComponent="span"
                  className="text-mono-180 dark:text-mono-40"
                  titleClassName="capitalize !text-inherit"
                />
              </Label>

              {description && (
                <Typography
                  className="text-mono-180 dark:text-mono-40"
                  variant="body1"
                >
                  {description}
                </Typography>
              )}
            </div>
          </div>

          <Switcher {...switcherProps} />
        </div>
      </div>
    );
  },
);

export default ToggleCard;
