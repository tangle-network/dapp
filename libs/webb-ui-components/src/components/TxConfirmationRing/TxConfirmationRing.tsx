import { forwardRef } from 'react';
import cx from 'classnames';
import { isHex } from 'viem';
import { ExternalLinkLine } from '@webb-tools/icons';

import ChainsRing from '../ChainsRing';
import { TxConfirmationRingProps } from './types';
import { Typography } from '../../typography';
import AddressChip from '../AddressChip';
import {
  useDarkMode as useNormalDarkMode,
  useNextDarkMode,
} from '../../hooks/useDarkMode';
import { shortenHex } from '../../utils';

const TxConfirmationRing = forwardRef<HTMLDivElement, TxConfirmationRingProps>(
  (
    {
      source,
      dest,
      title,
      subtitle,
      externalLink,
      className,
      isInNextApp = false,
      ...props
    },
    ref
  ) => {
    const useDarkMode = isInNextApp ? useNextDarkMode : useNormalDarkMode;

    const [isDarkMode] = useDarkMode();

    return (
      <div
        className={cx('flex justify-center', className)}
        ref={ref}
        {...props}
      >
        <ChainsRing
          chainItems={[
            {
              typedChainId: source.typedChainId,
              isActive: true,
            },
            undefined,
            undefined,
            undefined,
            {
              typedChainId: dest.typedChainId,
              isActive: true,
            },
          ]}
          circleContent={
            <div>
              <Typography
                variant="body1"
                fw="bold"
                ta="center"
                className="text-mono-140 dark:text-mono-80"
              >
                {title}
              </Typography>

              <div className="flex justify-center items-center gap-1">
                {subtitle && (
                  <Typography variant="body4">
                    {isHex(subtitle) ? shortenHex(subtitle) : subtitle}
                  </Typography>
                )}
                {externalLink && (
                  <a
                    href={externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLinkLine className="fill-mono-140 dark:fill-mono-80" />
                  </a>
                )}
              </div>
            </div>
          }
          additionalSvgContent={
            <>
              <g>
                {/* Source Address Chip */}
                <foreignObject width={91.333} height={24} x={0} y={92}>
                  <AddressChip
                    address={source.address}
                    isNoteAccount={source.isNoteAccount}
                    className="absolute top-1/2 translate-y-[-50%] px-[6.25px] min-w-[87.5px]"
                  />
                </foreignObject>

                {/* Destination Address Chip */}
                <foreignObject width={91.333} height={24} x={323.667} y={92}>
                  <AddressChip
                    address={dest.address}
                    isNoteAccount={dest.isNoteAccount}
                    className="absolute top-1/2 translate-y-[-50%] right-0 px-[6.25px] min-w-[87.5px]"
                  />
                </foreignObject>
                <circle
                  cx="87"
                  cy="104.082"
                  r="2.5"
                  stroke={isDarkMode ? '#4B3AA4' : '#B5A9F2'}
                  strokeWidth="2"
                />
                <path
                  d="M105.5 104.082L89.5 104.082"
                  stroke={isDarkMode ? '#4B3AA4' : '#B5A9F2'}
                  strokeWidth="2"
                />
                <circle
                  cx="328"
                  cy="104.082"
                  r="2.5"
                  transform="rotate(-180 328 104.082)"
                  stroke={isDarkMode ? '#4B3AA4' : '#B5A9F2'}
                  strokeWidth="2"
                />
                <path
                  d="M309.5 104.082L325.5 104.082"
                  stroke={isDarkMode ? '#4B3AA4' : '#B5A9F2'}
                  strokeWidth="2"
                />
              </g>
            </>
          }
          isInNextApp={isInNextApp}
        />
      </div>
    );
  }
);

export default TxConfirmationRing;
