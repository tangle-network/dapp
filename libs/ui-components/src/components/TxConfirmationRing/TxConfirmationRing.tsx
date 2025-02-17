import { ExternalLinkLine } from '@tangle-network/icons';
import cx from 'classnames';
import { forwardRef } from 'react';
import { isHex } from 'viem';
import { Typography } from '../../typography';
import { shortenHex } from '../../utils';
import AddressChip from '../AddressChip';
import ChainsRing from '../ChainsRing';
import { TxConfirmationRingProps } from './types';

const TxConfirmationRing = forwardRef<HTMLDivElement, TxConfirmationRingProps>(
  (
    { source, dest, title, subtitle, externalLink, className, ...props },
    ref,
  ) => {
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

              <div className="flex items-center justify-center gap-1">
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
                className="stroke-[#4B3AA4] dark:stroke-[#B5A9F2]"
                cx="87"
                cy="104.082"
                r="2.5"
                strokeWidth="2"
              />
              <path
                className="stroke-[#4B3AA4] dark:stroke-[#B5A9F2]"
                d="M105.5 104.082L89.5 104.082"
                strokeWidth="2"
              />
              <circle
                className="stroke-[#4B3AA4] dark:stroke-[#B5A9F2]"
                cx="328"
                cy="104.082"
                r="2.5"
                transform="rotate(-180 328 104.082)"
                strokeWidth="2"
              />
              <path
                className="stroke-[#4B3AA4] dark:stroke-[#B5A9F2]"
                d="M309.5 104.082L325.5 104.082"
                strokeWidth="2"
              />
            </g>
          }
        />
      </div>
    );
  },
);

export default TxConfirmationRing;
