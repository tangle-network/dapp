import { arrayShuffle } from '@polkadot/util';
import { ChainIcon } from '@webb-tools/icons';
import { useWebbUI } from '@webb-tools/webb-ui-components/hooks';
import cx from 'classnames';
import { ComponentProps, FC, forwardRef, useEffect, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { Typography } from '../../typography/Typography';
import { Chip } from '../Chip';
import { ChainsRingProps } from './types';

export const ChainsRing = forwardRef<HTMLDivElement, ChainsRingProps>(
  (
    {
      amount = 0,
      activeChains,
      className,
      destChain,
      destLabel,
      sourceChain,
      sourceLabel,
      tokenPairString,
      ...props
    },
    ref
  ) => {
    const { logger } = useWebbUI();
    // Effect for validate the props
    useEffect(() => {
      if (activeChains.length > 8) {
        logger.error('The active chain length should be less than 8');
      }

      if (sourceChain && !activeChains.includes(sourceChain)) {
        logger.error('The source chain should be included in active chains');
      }

      if (destChain && !activeChains.includes(destChain)) {
        logger.error(
          'The destination chain should be included in active chains'
        );
      }
    }, [activeChains, sourceChain, destChain, logger]);

    const displayedChains = useMemo(() => {
      let chains: string[] = [];

      // Filter out the source and destination chain
      let filteredChains = activeChains.filter(
        (chain) => chain !== sourceChain && chain !== destChain
      );

      // Adding empty string to filter chains to make sure the length is 6
      filteredChains = [
        ...filteredChains,
        ...Array.from({ length: 6 - filteredChains.length }, () => ''),
      ];

      // Shuffle the filtered chains
      filteredChains = arrayShuffle(filteredChains);
      let sliceIndex = 0;

      if (sourceChain) {
        chains.unshift(sourceChain);
        sliceIndex = 3;
      } else {
        sliceIndex = 4;
      }

      chains = [...chains, ...filteredChains.slice(0, sliceIndex)];

      if (destChain && destChain !== sourceChain) {
        chains.push(destChain);
      }

      chains = [...chains, ...filteredChains.slice(sliceIndex)];

      // Adding empty string to make sure the length is 8
      chains = [
        ...chains,
        ...Array.from({ length: 8 - chains.length }, () => ''),
      ];

      return chains;
    }, [activeChains, destChain, sourceChain]);

    const isDisplaySourceLabel = useMemo(() => {
      return sourceChain && sourceLabel;
    }, [sourceChain, sourceLabel]);

    const isDisplayDestLabel = useMemo(() => {
      return destChain && destLabel;
    }, [destChain, destLabel]);

    return (
      <div
        {...props}
        className={cx(
          'flex items-center justify-center w-[500px] h-[210px] box-border mx-auto',
          className
        )}
        ref={ref}
      >
        <div className="relative">
          <svg
            width={184}
            height={183}
            fill="none"
            xmlns="http://www.w3.org/2000/svtg"
          >
            <path
              d="M92.869.33v182.012M183.875 91.336H1.863M29.002 154.51l63.754-63.754-63.754-63.754M156.761 27.002L93.006 90.756l63.754 63.754"
              className="stroke-mono-40"
            />
            <path
              d="M28.057 27.182L92.375.542l64.318 26.64L183.334 91.5l-26.641 64.318-64.318 26.641-64.318-26.641L1.417 91.5l26.64-64.318z"
              className="stroke-mono-80 dark:stroke-mono-120"
            />
          </svg>

          <ChainIconWrapper
            className={cx(
              'absolute -translate-y-1/2 -translate-x-1/2 top-[15%] left-[15%] z-[1]',
              {
                'border-2 border-purple-40 dark:border-purple-90 rounded-full':
                  !!isDisplaySourceLabel,
              }
            )}
            size="lg"
            name={displayedChains[0]}
          />
          {isDisplaySourceLabel && (
            <span
              className={cx(
                'absolute top-0 translate-x-1 translate-y-3.5 right-full'
              )}
            >
              <span className="relative">
                <Chip color="purple" className="min-w-max">
                  {isDisplaySourceLabel}
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
                    'border-purple-40 dark:border-purple-90 w-3',
                    'right-0 bottom-1/2 translate-x-full translate-y-0.5'
                  )}
                />
              </span>
            </span>
          )}

          <ChainIconWrapper
            className={cx(
              'absolute top-0 -translate-x-1/2 -translate-y-1/2 left-1/2 z-[1]'
            )}
            size="lg"
            name={displayedChains[1]}
          />

          <ChainIconWrapper
            className={cx(
              'absolute top-[15%] right-[15%] translate-x-1/2 -translate-y-1/2 z-[1]'
            )}
            size="lg"
            name={displayedChains[2]}
          />

          <ChainIconWrapper
            className={cx(
              'absolute right-0 translate-x-1/2 -translate-y-1/2 top-1/2 z-[1]'
            )}
            size="lg"
            name={displayedChains[3]}
          />

          <ChainIconWrapper
            className={cx(
              'absolute bottom-[15%] right-[15%] translate-x-1/2 translate-y-1/2 z-[1]',
              {
                'border border-purple-40 dark:border-purple-90 bg-purple-40 dark:bg-purple-90 rounded-full':
                  !!isDisplayDestLabel,
              }
            )}
            size="lg"
            name={displayedChains[4]}
          />
          {isDisplayDestLabel && (
            <span
              className={cx(
                'absolute -translate-x-0.5 -translate-y-3.5 bottom-0 left-full'
              )}
            >
              <span className="relative">
                <Chip color="purple" className="min-w-max">
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
                    'border-purple-40 dark:border-purple-90 w-3',
                    'left-0 bottom-0 -translate-x-3.5 -translate-y-2'
                  )}
                />
              </span>
            </span>
          )}

          <ChainIconWrapper
            className={cx(
              'absolute bottom-0 -translate-x-1/2 translate-y-1/2 left-1/2 z-[1]'
            )}
            size="lg"
            name={displayedChains[5]}
          />

          <ChainIconWrapper
            className={cx(
              'absolute bottom-[15px] left-0 translate-x-1/2 z-[1]'
            )}
            size="lg"
            name={displayedChains[6]}
          />

          <ChainIconWrapper
            className={cx(
              'absolute left-0 -translate-x-1/2 -translate-y-1/2 top-1/2 z-[1]'
            )}
            size="lg"
            name={displayedChains[7]}
          />

          <div
            className={cx(
              'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
              'rounded-full bg-mono-0 dark:bg-mono-160 border-2 border-purple-40 dark:border-purple-90',
              'w-[133px] h-[133px] flex flex-col justify-center items-center'
            )}
          >
            <Typography
              variant="body4"
              fw="bold"
              className="text-mono-160 dark:text-mono-0"
            >
              {amount.toString()}
            </Typography>
            {tokenPairString && (
              <Typography
                variant="body4"
                fw="bold"
                className="uppercase text-mono-140 dark:text-mono-80"
              >
                {tokenPairString}
              </Typography>
            )}
          </div>
        </div>
      </div>
    );
  }
);

export const ChainIconWrapper: FC<ComponentProps<typeof ChainIcon>> = ({
  name,
  className,
  ...props
}) => {
  if (!name) {
    return (
      <span
        className={twMerge(
          'w-6 h-6 border-2 rounded-full',
          'bg-mono-120 bg-opacity-10 dark:bg-opacity-70',
          'border-purple-40 dark:border-purple-90',
          className
        )}
      />
    );
  }

  return <ChainIcon {...props} name={name} className={className} />;
};
