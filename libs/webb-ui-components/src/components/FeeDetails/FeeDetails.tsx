import cx from 'classnames';
import { cloneElement, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import {
  Accordion,
  AccordionButtonBase,
  AccordionContent,
  AccordionItem,
} from '../Accordion';
import { TitleWithInfo } from '../TitleWithInfo';
import { FeeDetailsProps } from './types';
import { Typography } from '../../typography/Typography';
import {
  ArrowDropDownFill,
  CornerDownRightLine,
  TokenIcon,
} from '@webb-tools/icons';

/**
 * FeeDetails component is used to display fees for a transaction.
 * Note: This is the base component for UI displaying.
 * Refer to `containers/BridgeFeeDetails` for a more specific implementation for the Hubble Bridge.
 *
 * Props:
 * - `info`: The info to show in the tooltip
 * - `totalFee`: The total fee
 * - `totalFeeToken`: The token of the total fee
 * - `items`: The list of fee items
 *
 * @example
 *
 * ```jsx
 *  <FeeDetails
 *    info="This is the fee"
 *    totalFee={100}
 *    totalFeeToken="WEBB"
 *    items={[
 *      {
 *        name: 'Gas',
 *        Icon: <GasStationFill />,
 *        info: 'This is the gas fee',
 *        value: 100,
 *        tokenSymbol: 'WEBB',
 *        valueInUsd: 100,
 *     },
 *    ]}
 *  />
 * ```
 */
const FeeDetails = forwardRef<HTMLDivElement, FeeDetailsProps>(
  ({ className, info, totalFee, totalFeeToken = '', items, ...props }, ref) => {
    return (
      <Accordion
        {...props}
        className={twMerge(
          'rounded-lg p-3 w-full max-w-lg',
          'bg-[#F7F8F7]/80 hover:bg-mono-20 dark:bg-mono-180',
          className
        )}
        ref={ref}
        collapsible
        type="single"
      >
        <AccordionItem value="fee-details" className="space-y-2">
          <AccordionButtonBase className="flex items-center justify-between w-full">
            <TitleWithInfo
              title="Fees"
              className="text-mono-120 dark:text-mono-100"
              titleClassName={cx('!text-inherit')}
              info={info}
            />

            <div className="flex items-center">
              <Typography variant="body1" fw="bold">
                {typeof totalFee === 'number'
                  ? `~ ${totalFee} ${totalFeeToken}`.trim()
                  : '-'}
              </Typography>

              {typeof totalFee === 'number' && totalFeeToken && (
                <TokenIcon name={totalFeeToken} className="ml-2" />
              )}

              <ArrowDropDownFill
                size="lg"
                className="ml-2 fill-mono-120 dark:fill-mono-100"
              />
            </div>
          </AccordionButtonBase>

          <AccordionContent className="px-2 py-0 space-y-2">
            {items?.map(
              (
                { name, info, tokenSymbol = '', value, Icon, valueInUsd },
                index
              ) => (
                <div
                  className="flex items-center justify-between text-mono-120 dark:text-mono-100"
                  key={`${name}-${index}`}
                >
                  <div className="flex items-center gap-[2px] !text-current">
                    <CornerDownRightLine className="!fill-current" />

                    {Icon &&
                      cloneElement(Icon, {
                        ...Icon.props,
                        size: 'md',
                        className: twMerge(
                          Icon.props.className,
                          '!fill-current'
                        ),
                      })}

                    <TitleWithInfo
                      title={name}
                      info={info}
                      variant="body1"
                      titleClassName={cx('!text-inherit')}
                      className="!text-inherit space-x-[2px]"
                    />
                  </div>

                  <div className="flex items-start gap-2">
                    <Typography
                      variant="body1"
                      fw="bold"
                      className="text-mono-200 dark:text-mono-40"
                    >
                      {typeof value === 'number'
                        ? `~ ${value} ${tokenSymbol}`.trim()
                        : '-'}
                    </Typography>

                    {typeof valueInUsd === 'number' && (
                      <Typography
                        variant="body1"
                        fw="semibold"
                        className="!text-inherit"
                      >
                        `(≈ ${valueInUsd}))`
                      </Typography>
                    )}
                  </div>
                </div>
              )
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }
);

FeeDetails.displayName = 'FeeDetails';

export default FeeDetails;
