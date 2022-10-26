import { TokenIcon } from '../../icons';
import { Typography } from '../../typography';
import cx from 'classnames';
import { forwardRef } from 'react';

import { Chip } from '../Chip';
import { TokensRingProps } from './types';

export const TokensRing = forwardRef<HTMLDivElement, TokensRingProps>(
  (
    {
      amount = 0,
      className,
      destChain,
      destLabel = 'destination',
      sourceChain,
      sourceLabel = 'source',
      tokenPairString,
      ...props
    },
    ref
  ) => {
    return (
      <div
        {...props}
        className={cx('flex items-center justify-center w-[500px] h-[275px] box-border p-10 mx-auto', className)}
        ref={ref}
      >
        <div className='relative'>
          <svg width={184} height={183} fill='none' xmlns='http://www.w3.org/2000/svtg'>
            <path
              d='M92.869.33v182.012M183.875 91.336H1.863M29.002 154.51l63.754-63.754-63.754-63.754M156.761 27.002L93.006 90.756l63.754 63.754'
              className='stroke-mono-40'
            />
            <path
              d='M28.057 27.182L92.375.542l64.318 26.64L183.334 91.5l-26.641 64.318-64.318 26.641-64.318-26.641L1.417 91.5l26.64-64.318z'
              className='stroke-mono-80 dark:stroke-mono-120'
            />
          </svg>

          {/** Dot */}
          <TokenIcon
            className={cx('absolute -translate-y-1/2 -translate-x-1/2 top-[15%] left-[15%] z-[1]', {
              'border-2 border-purple-40 dark:border-purple-90 rounded-full':
                sourceChain === 'dot' || destChain === 'dot',
            })}
            size='lg'
            name='dot'
          />
          {sourceChain === 'dot' && (
            <span className={cx('absolute -translate-y-full top-[5%] right-full')}>
              <span className='relative'>
                <Chip color='purple' className='min-w-max'>
                  {sourceLabel}
                </Chip>
                <span
                  className={cx(
                    'absolute w-2 h-2',
                    'border-2 border-purple-40 dark:border-purple-90 rounded-full',
                    'right-0 top-1/2 -translate-y-1/2 translate-x-1/3'
                  )}
                />
                <span
                  className={cx(
                    'absolute border',
                    'border-purple-40 dark:border-purple-90 w-7 rotate-45',
                    'right-0 bottom-0 translate-y-1 translate-x-6'
                  )}
                />
              </span>
            </span>
          )}
          {destChain === 'dot' && (
            <span className={cx('absolute -translate-y-full top-[20%] right-full')}>
              <span className='relative'>
                <Chip color='purple' className='min-w-max'>
                  {destLabel}
                </Chip>
                <span
                  className={cx(
                    'absolute w-2 h-2',
                    'border-2 border-purple-40 dark:border-purple-90 rounded-full',
                    'right-0 top-1/2 -translate-y-1/2 translate-x-1/3'
                  )}
                />
                <span
                  className={cx(
                    'absolute border',
                    'border-purple-40 dark:border-purple-90 w-4',
                    'right-0 top-1/2 -translate-y-1/2 translate-x-4'
                  )}
                />
              </span>
            </span>
          )}

          {/** Avax */}
          <TokenIcon
            className={cx('absolute top-0 -translate-x-1/2 -translate-y-1/2 left-1/2 z-[1]', {
              'border-2 border-purple-40 dark:border-purple-90 rounded-full':
                sourceChain === 'avax' || destChain === 'avax',
            })}
            size='lg'
            name='avax'
          />
          {sourceChain === 'avax' && (
            <span className={cx('absolute -translate-x-7 -translate-y-12 top-0 right-1/2')}>
              <span className='relative'>
                <Chip color='purple' className='min-w-max'>
                  {sourceLabel}
                </Chip>
                <span
                  className={cx(
                    'absolute w-2 h-2',
                    'border-2 border-purple-40 dark:border-purple-90 rounded-full',
                    'right-0 top-1/2 -translate-y-1/2 translate-x-1/3'
                  )}
                />
                <span
                  className={cx(
                    'absolute border',
                    'border-purple-40 dark:border-purple-90 w-9 rotate-45',
                    'right-0 bottom-0 translate-y-1 translate-x-8'
                  )}
                />
              </span>
            </span>
          )}
          {destChain === 'avax' && (
            <span className={cx('absolute translate-x-7 -translate-y-12 top-0 left-1/2')}>
              <span className='relative'>
                <Chip color='purple' className='min-w-max'>
                  {destLabel}
                </Chip>
                <span
                  className={cx(
                    'absolute w-2 h-2',
                    'border-2 border-purple-40 dark:border-purple-90 rounded-full',
                    'left-0 top-1/2 -translate-y-1/2 -translate-x-1/3'
                  )}
                />
                <span
                  className={cx(
                    'absolute border',
                    'border-purple-40 dark:border-purple-90 w-9 -rotate-45',
                    'left-0 bottom-0 translate-y-1 -translate-x-8'
                  )}
                />
              </span>
            </span>
          )}

          {/** KSM */}
          <TokenIcon
            className={cx('absolute top-[15%] right-[15%] translate-x-1/2 -translate-y-1/2 z-[1]', {
              'border border-purple-40 dark:border-purple-90 bg-purple-40 dark:bg-purple-90 rounded-full':
                sourceChain === 'ksm' || destChain === 'ksm',
            })}
            size='lg'
            name='ksm'
          />
          {sourceChain === 'ksm' && (
            <span className={cx('absolute -translate-y-full top-[5%] left-full')}>
              <span className='relative'>
                <Chip color='purple' className='min-w-max'>
                  {sourceLabel}
                </Chip>
                <span
                  className={cx(
                    'absolute w-2 h-2',
                    'border-2 border-purple-40 dark:border-purple-90 rounded-full',
                    'left-0 top-1/2 -translate-y-1/2 -translate-x-1/3'
                  )}
                />
                <span
                  className={cx(
                    'absolute border',
                    'border-purple-40 dark:border-purple-90 w-7 -rotate-45',
                    'left-0 bottom-0 translate-y-1 -translate-x-6'
                  )}
                />
              </span>
            </span>
          )}
          {destChain === 'ksm' && (
            <span className={cx('absolute -translate-y-full top-[20%] left-full')}>
              <span className='relative'>
                <Chip color='purple' className='min-w-max'>
                  {destLabel}
                </Chip>
                <span
                  className={cx(
                    'absolute w-2 h-2',
                    'border-2 border-purple-40 dark:border-purple-90 rounded-full',
                    'left-0 top-1/2 -translate-y-1/2 -translate-x-1/3'
                  )}
                />
                <span
                  className={cx(
                    'absolute border',
                    'border-purple-40 dark:border-purple-90 w-4',
                    'left-0 top-1/2 -translate-y-1/2 -translate-x-4'
                  )}
                />
              </span>
            </span>
          )}

          {/** Eth */}
          <TokenIcon
            className={cx('absolute right-0 translate-x-1/2 -translate-y-1/2 top-1/2 z-[1]', {
              'border border-purple-40 dark:border-purple-90 bg-purple-40 dark:bg-purple-90 rounded-full':
                sourceChain === 'eth' || destChain === 'eth',
            })}
            size='lg'
            name='eth'
          />
          {sourceChain === 'eth' && (
            <span className={cx('absolute translate-x-7 -translate-y-full top-[40%] left-full')}>
              <span className='relative'>
                <Chip color='purple' className='min-w-max'>
                  {sourceLabel}
                </Chip>
                <span
                  className={cx(
                    'absolute w-2 h-2',
                    'border-2 border-purple-40 dark:border-purple-90 rounded-full',
                    'left-0 top-1/2 -translate-y-1/2 -translate-x-1/3'
                  )}
                />
                <span
                  className={cx(
                    'absolute border',
                    'border-purple-40 dark:border-purple-90 w-7 -rotate-45',
                    'left-0 bottom-0 translate-y-1 -translate-x-6'
                  )}
                />
              </span>
            </span>
          )}
          {destChain === 'eth' && (
            <span className={cx('absolute translate-x-7 translate-y-full bottom-[40%] left-full')}>
              <span className='relative'>
                <Chip color='purple' className='min-w-max'>
                  {destLabel}
                </Chip>
                <span
                  className={cx(
                    'absolute w-2 h-2',
                    'border-2 border-purple-40 dark:border-purple-90 rounded-full',
                    'left-0 top-1/2 -translate-y-1/2 -translate-x-1/3'
                  )}
                />
                <span
                  className={cx(
                    'absolute border',
                    'border-purple-40 dark:border-purple-90 w-7 rotate-45',
                    'left-0 bottom-0 -translate-y-5 -translate-x-6'
                  )}
                />
              </span>
            </span>
          )}

          {/** Matic */}
          <TokenIcon
            className={cx('absolute bottom-[15%] right-[15%] translate-x-1/2 translate-y-1/2 z-[1]', {
              'border border-purple-40 dark:border-purple-90 bg-purple-40 dark:bg-purple-90 rounded-full':
                sourceChain === 'matic' || destChain === 'matic',
            })}
            size='lg'
            name='matic'
          />
          {sourceChain === 'matic' && (
            <span className={cx('absolute translate-y-full bottom-[5%] left-full')}>
              <span className='relative'>
                <Chip color='purple' className='min-w-max'>
                  {sourceLabel}
                </Chip>
                <span
                  className={cx(
                    'absolute w-2 h-2',
                    'border-2 border-purple-40 dark:border-purple-90 rounded-full',
                    'left-0 top-1/2 -translate-y-1/2 -translate-x-1/3'
                  )}
                />
                <span
                  className={cx(
                    'absolute border',
                    'border-purple-40 dark:border-purple-90 w-7 rotate-45',
                    'left-0 bottom-0 -translate-x-6 -translate-y-5'
                  )}
                />
              </span>
            </span>
          )}
          {destChain === 'matic' && (
            <span className={cx('absolute translate-y-full bottom-[20%] left-full')}>
              <span className='relative'>
                <Chip color='purple' className='min-w-max'>
                  {destLabel}
                </Chip>
                <span
                  className={cx(
                    'absolute w-2 h-2',
                    'border-2 border-purple-40 dark:border-purple-90 rounded-full',
                    'left-0 top-1/2 -translate-y-1/2 -translate-x-1/3'
                  )}
                />
                <span
                  className={cx(
                    'absolute border',
                    'border-purple-40 dark:border-purple-90 w-4',
                    'left-0 top-1/2 -translate-y-1/2 -translate-x-4'
                  )}
                />
              </span>
            </span>
          )}

          {/** Op */}
          <TokenIcon
            className={cx('absolute bottom-0 -translate-x-1/2 translate-y-1/2 left-1/2 z-[1]', {
              'border-2 border-purple-40 dark:border-purple-90 rounded-full':
                sourceChain === 'op' && destChain === 'op',
            })}
            size='lg'
            name='op'
          />
          {sourceChain === 'op' && (
            <span className={cx('absolute -translate-x-7 translate-y-12 bottom-0 right-1/2')}>
              <span className='relative'>
                <Chip color='purple' className='min-w-max'>
                  {sourceLabel}
                </Chip>
                <span
                  className={cx(
                    'absolute w-2 h-2',
                    'border-2 border-purple-40 dark:border-purple-90 rounded-full',
                    'right-0 top-1/2 -translate-y-1/2 translate-x-1/3'
                  )}
                />
                <span
                  className={cx(
                    'absolute border',
                    'border-purple-40 dark:border-purple-90 w-9 -rotate-45',
                    'right-0 bottom-0 -translate-y-5 translate-x-8'
                  )}
                />
              </span>
            </span>
          )}
          {destChain === 'op' && (
            <span className={cx('absolute translate-x-7 translate-y-12 bottom-0 left-1/2')}>
              <span className='relative'>
                <Chip color='purple' className='min-w-max'>
                  {destLabel}
                </Chip>
                <span
                  className={cx(
                    'absolute w-2 h-2',
                    'border-2 border-purple-40 dark:border-purple-90 rounded-full',
                    'left-0 top-1/2 -translate-y-1/2 -translate-x-1/3'
                  )}
                />
                <span
                  className={cx(
                    'absolute border',
                    'border-purple-40 dark:border-purple-90 w-9 rotate-45',
                    'left-0 bottom-0 -translate-y-5 -translate-x-8'
                  )}
                />
              </span>
            </span>
          )}

          {/** Arbitrum */}
          <TokenIcon
            className={cx('absolute bottom-[15px] left-0 translate-x-1/2 z-[1]', {
              'border-2 border-purple-40 dark:border-purple-90 rounded-full':
                sourceChain === 'arbitrum' || destChain === 'arbitrum',
            })}
            size='lg'
            name='arbitrum'
          />
          {sourceChain === 'arbitrum' && (
            <span className={cx('absolute translate-y-full bottom-[5%] right-full')}>
              <span className='relative'>
                <Chip color='purple' className='min-w-max'>
                  {sourceLabel}
                </Chip>
                <span
                  className={cx(
                    'absolute w-2 h-2',
                    'border-2 border-purple-40 dark:border-purple-90 rounded-full',
                    'right-0 top-1/2 -translate-y-1/2 translate-x-1/3'
                  )}
                />
                <span
                  className={cx(
                    'absolute border',
                    'border-purple-40 dark:border-purple-90 w-7 -rotate-45',
                    'right-0 bottom-0 translate-x-6 -translate-y-5'
                  )}
                />
              </span>
            </span>
          )}
          {destChain === 'arbitrum' && (
            <span className={cx('absolute translate-y-full bottom-[20%] right-full')}>
              <span className='relative'>
                <Chip color='purple' className='min-w-max'>
                  {destLabel}
                </Chip>
                <span
                  className={cx(
                    'absolute w-2 h-2',
                    'border-2 border-purple-40 dark:border-purple-90 rounded-full',
                    'right-0 top-1/2 -translate-y-1/2 translate-x-1/3'
                  )}
                />
                <span
                  className={cx(
                    'absolute border',
                    'border-purple-40 dark:border-purple-90 w-4',
                    'right-0 top-1/2 -translate-y-1/2 translate-x-4'
                  )}
                />
              </span>
            </span>
          )}

          {/** One */}
          <TokenIcon
            className={cx('absolute left-0 -translate-x-1/2 -translate-y-1/2 top-1/2 z-[1]', {
              'border-2 border-purple-40 dark:border-purple-90 rounded-full':
                sourceChain === 'one' || destChain === 'one',
            })}
            size='lg'
            name='one'
          />
          {sourceChain === 'one' && (
            <span className={cx('absolute -translate-x-5 -translate-y-full top-[40%] right-full')}>
              <span className='relative'>
                <Chip color='purple' className='min-w-max'>
                  {sourceLabel}
                </Chip>
                <span
                  className={cx(
                    'absolute w-2 h-2',
                    'border-2 border-purple-40 dark:border-purple-90 rounded-full',
                    'right-0 top-1/2 -translate-y-1/2 translate-x-1/3'
                  )}
                />
                <span
                  className={cx(
                    'absolute border',
                    'border-purple-40 dark:border-purple-90 w-7 rotate-45',
                    'right-0 bottom-0 translate-y-1 translate-x-6'
                  )}
                />
              </span>
            </span>
          )}
          {destChain === 'one' && (
            <span className={cx('absolute -translate-x-5 translate-y-full bottom-[40%] right-full')}>
              <span className='relative'>
                <Chip color='purple' className='min-w-max'>
                  {destLabel}
                </Chip>
                <span
                  className={cx(
                    'absolute w-2 h-2',
                    'border-2 border-purple-40 dark:border-purple-90 rounded-full',
                    'right-0 top-1/2 -translate-y-1/2 translate-x-1/3'
                  )}
                />
                <span
                  className={cx(
                    'absolute border',
                    'border-purple-40 dark:border-purple-90 w-7 -rotate-45',
                    'right-0 bottom-0 -translate-y-5 translate-x-6'
                  )}
                />
              </span>
            </span>
          )}

          <div
            className={cx(
              'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
              'rounded-full bg-mono-0 dark:bg-mono-160 border-2 border-purple-40 dark:border-purple-90',
              'w-[133px] h-[133px] flex flex-col justify-center items-center'
            )}
          >
            <Typography variant='body4' fw='bold' className='text-mono-160 dark:text-mono-0'>
              {amount.toString()}
            </Typography>
            {tokenPairString && (
              <Typography variant='body4' fw='bold' className='uppercase text-mono-140 dark:text-mono-80'>
                {tokenPairString}
              </Typography>
            )}
          </div>
        </div>
      </div>
    );
  }
);
