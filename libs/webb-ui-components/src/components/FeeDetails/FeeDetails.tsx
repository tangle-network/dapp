import isPrimitive from '@webb-tools/dapp-types/utils/isPrimitive';
import {
  ArrowDropDownFill,
  CornerDownRightLine,
  TokenIcon,
} from '@webb-tools/icons';
import cx from 'classnames';
import { cloneElement, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { Typography } from '../../typography/Typography';
import numberToString from '../../utils/numberToString';
import {
  Accordion,
  AccordionButtonBase,
  AccordionContent,
  AccordionItem,
} from '../Accordion';
import { TitleWithInfo } from '../TitleWithInfo';
import SkeletonLoader from '../SkeletonLoader';
import { FeeDetailsProps } from './types';

/**
 * FeeDetails component is used to display fees for a transaction.
 * Note: This is the base component for UI displaying.
 * Refer to `containers/BridgeFeeDetails` for a more specific implementation for the Hubble Bridge.
 *
 * Props:
 * - `info`: The info to show in the tooltip
 * - `totalFee`: The total fee
 * - `totalFeeToken`: The token of the total fee
 * - `totalFeeCmp`: The total fee component
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
  (
    {
      className,
      title,
      info,
      totalFee,
      totalFeeToken = '',
      totalFeeCmp,
      items,
      isTotalLoading,
      isDefaultOpen,
      isDisabledBgColor,
      ...props
    },
    ref,
  ) => {
    return (
      <Accordion
        {...props}
        className={twMerge(
          'rounded-lg w-full',
          !isDisabledBgColor &&
            'bg-[#F7F8F7]/80 hover:bg-mono-20 dark:bg-mono-180',
          className,
        )}
        ref={ref}
        collapsible
        type="single"
        defaultValue={isDefaultOpen ? 'fee-details' : undefined}
      >
        <AccordionItem
          value="fee-details"
          className="p-0"
          disabled={!items?.length}
        >
          <AccordionButtonBase
            className={cx(
              'group flex items-center justify-between w-full',
              'p-3',
            )}
          >
            <TitleWithInfo
              title={title ?? 'Fees'}
              className="text-mono-120 dark:text-mono-100"
              titleClassName={cx('!text-inherit')}
              info={info}
            />

            <div className="flex items-center">
              {isTotalLoading ? (
                <SkeletonLoader className="w-14 dark:bg-mono-140" />
              ) : (
                (totalFeeCmp ?? (
                  <>
                    <Typography variant="body1" fw="bold">
                      {typeof totalFee === 'number'
                        ? `~${numberToString(totalFee).slice(
                            0,
                            10,
                          )} ${totalFeeToken}`.trim()
                        : '-'}
                    </Typography>

                    {typeof totalFee === 'number' && totalFeeToken && (
                      <TokenIcon name={totalFeeToken} className="ml-2" />
                    )}
                  </>
                ))
              )}

              <ArrowDropDownFill
                size="lg"
                className={cx(
                  'ml-2 fill-mono-120 dark:fill-mono-100 duration-300',
                  'group-radix-state-open:rotate-180',
                  'group-radix-state-closed:rotate-0',
                )}
              />
            </div>
          </AccordionButtonBase>

          <AccordionContent
            className={cx(
              'overflow-hidden p-0',
              'radix-state-open:animate-accordion-slide-down',
              'radix-state-closed:animate-accordion-slide-up',
            )}
          >
            {/** Put content in the <div></div> to prevent UI shifting when animating */}
            <div className="px-5 pt-0 pb-3 space-y-2">
              {items?.map(
                (
                  {
                    name,
                    info,
                    tokenSymbol = '',
                    value,
                    Icon,
                    valueInUsd,
                    isLoading,
                  },
                  index,
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
                            '!fill-current',
                          ),
                        })}

                      <TitleWithInfo
                        title={name}
                        info={info}
                        isCenterInfo
                        variant="body1"
                        titleClassName={cx('!text-inherit')}
                        className="!text-inherit space-x-[2px]"
                      />
                    </div>

                    <div className="flex items-start gap-2 !text-inherit">
                      {isLoading ? (
                        <SkeletonLoader className="w-14 dark:bg-mono-140" />
                      ) : (
                        <>
                          {isPrimitive(value) ? (
                            <Typography
                              variant="body1"
                              fw="bold"
                              className="text-mono-200 dark:text-mono-40"
                            >
                              {value !== null && value !== undefined
                                ? typeof value === 'number'
                                  ? `~${numberToString(value).slice(
                                      0,
                                      10,
                                    )} ${tokenSymbol}`.trim()
                                  : value
                                : '-'}
                            </Typography>
                          ) : (
                            value
                          )}

                          {typeof valueInUsd === 'number' && (
                            <Typography
                              variant="body1"
                              fw="semibold"
                              className="!text-inherit"
                            >
                              {`(≈${valueInUsd})`}
                            </Typography>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ),
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  },
);

FeeDetails.displayName = 'FeeDetails';

export default FeeDetails;
