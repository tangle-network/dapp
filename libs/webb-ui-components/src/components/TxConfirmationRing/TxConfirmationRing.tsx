import { forwardRef } from 'react';
import { ChainIcon, ExternalLinkLine } from '@webb-tools/icons';
import { chainsConfig } from '@webb-tools/dapp-config/chains/chain-config';
import cx from 'classnames';
import { isHex } from 'viem';

import { TxConfirmationRingProps } from './types';
import { Typography } from '../../typography';
import AddressChip from '../AddressChip';
import { useDarkMode } from '../../hooks/useDarkMode';
import { shortenHex } from '../../utils';

const TxConfirmationRing = forwardRef<HTMLDivElement, TxConfirmationRingProps>(
  (
    {
      source,
      dest,
      poolName,
      poolAddress,
      poolExplorerUrl,
      className,
      ...props
    },
    ref
  ) => {
    const [isDarkMode] = useDarkMode();

    return (
      <div
        className={cx('flex justify-center', className)}
        ref={ref}
        {...props}
      >
        <div className="relative">
          {/* Source Chain Icon */}
          <ChainIcon
            name={chainsConfig[source.typedChainId].name}
            className="absolute top-1/2 translate-y-[-50%] left-[105.5px]"
            size="lg"
          />

          {/* Destination Chain Icon */}
          <ChainIcon
            name={chainsConfig[dest.typedChainId].name}
            className="absolute top-1/2 translate-y-[-50%] right-[105.5px]"
            size="lg"
          />

          {/* Circle Inside (contain pool info) */}
          <div
            className={cx(
              'absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]',
              'bg-mono-0 dark:bg-[rgba(247,248,247,0.10)]',
              'aspect-square w-[128px] rounded-full',
              'flex justify-center items-center'
            )}
            style={{ backdropFilter: 'blur(12px)' }}
          >
            <div>
              <Typography
                variant="body1"
                fw="bold"
                ta="center"
                className="text-mono-140 dark:text-mono-80"
              >
                {poolName}
              </Typography>
              {isHex(poolAddress) && (
                <div className="flex justify-center items-center gap-1">
                  <Typography variant="body4">
                    {shortenHex(poolAddress)}
                  </Typography>
                  {poolExplorerUrl && (
                    <a
                      href={poolExplorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLinkLine className="fill-mono-140 dark:fill-mono-80" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          <svg
            width="415"
            height="208"
            viewBox="0 0 415 208"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g>
              {/* Source Address Chip */}
              <foreignObject width={91.333} height={24} x={0} y={92}>
                <AddressChip
                  address={source.address}
                  isNoteAccount={source.isNoteAccount}
                  className="absolute top-1/2 translate-y-[-50%] px-[6.25px]"
                />
              </foreignObject>

              {/* Destination Address Chip */}
              <foreignObject width={91.333} height={24} x={323.667} y={92}>
                <AddressChip
                  address={dest.address}
                  isNoteAccount={dest.isNoteAccount}
                  className="absolute top-1/2 translate-y-[-50%] right-0 px-[6.25px]"
                />
              </foreignObject>
            </g>
            <path
              d="M144.243 40.7431L207.5 14.5412L270.757 40.7431L296.959 104L270.757 167.257L207.5 193.459L144.243 167.257L118.041 104L144.243 40.7431Z"
              stroke="#C2C8D4"
            />
            <path d="M207.5 14V194" stroke="#E2E5EB" />
            <path d="M143.471 39.9688L270.75 167.248" stroke="#9CA0B0" />
            <rect
              x="143.471"
              y="23"
              width="24"
              height="24"
              transform="rotate(45 143.471 23)"
              fill="#F7F8F7"
              fillOpacity="0.1"
            />
            <rect
              x="143.471"
              y="21.5858"
              width="26"
              height="26"
              rx="5"
              transform="rotate(45 143.471 21.5858)"
              stroke="#9CA0B0"
              strokeWidth="2"
            />
            <rect
              x="270.75"
              y="150.277"
              width="24"
              height="24"
              transform="rotate(45 270.75 150.277)"
              fill="#F7F8F7"
              fillOpacity="0.1"
            />
            <rect
              x="270.75"
              y="148.863"
              width="26"
              height="26"
              rx="5"
              transform="rotate(45 270.75 148.863)"
              stroke="#9CA0B0"
              strokeWidth="2"
            />
            <path d="M270.5 39.9688L143.221 167.248" stroke="#9CA0B0" />
            <rect
              x="287.471"
              y="39.9688"
              width="24"
              height="24"
              transform="rotate(135 287.471 39.9688)"
              fill="#F7F8F7"
              fillOpacity="0.1"
            />
            <rect
              x="288.885"
              y="39.9688"
              width="26"
              height="26"
              rx="5"
              transform="rotate(135 288.885 39.9688)"
              stroke="#9CA0B0"
              strokeWidth="2"
            />
            <rect
              x="160.191"
              y="167.25"
              width="24"
              height="24"
              transform="rotate(135 160.191 167.25)"
              fill="#F7F8F7"
              fillOpacity="0.1"
            />
            <rect
              x="161.606"
              y="167.25"
              width="26"
              height="26"
              rx="5"
              transform="rotate(135 161.606 167.25)"
              stroke="#9CA0B0"
              strokeWidth="2"
            />
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
            <path d="M117.5 104.082L297.5 104.082" stroke="#E2E5EB" />
            <rect
              x="104.5"
              y="91.082"
              width="26"
              height="26"
              rx="5"
              stroke={isDarkMode ? '#4B3AA4' : '#B5A9F2'}
              strokeWidth="2"
            />
            <rect
              x="284.5"
              y="91.082"
              width="26"
              height="26"
              rx="5"
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
            <path d="M207.5 14V194" stroke="#9CA0B0" />
            <rect
              x="219.5"
              y="2"
              width="24"
              height="24"
              transform="rotate(90 219.5 2)"
              fill="#F7F8F7"
              fillOpacity="0.1"
            />
            <rect
              x="220.5"
              y="1"
              width="26"
              height="26"
              rx="5"
              transform="rotate(90 220.5 1)"
              stroke="#9CA0B0"
              strokeWidth="2"
            />
            <rect
              x="219.5"
              y="182"
              width="24"
              height="24"
              transform="rotate(90 219.5 182)"
              fill="#F7F8F7"
              fillOpacity="0.1"
            />
            <rect
              x="220.5"
              y="181"
              width="26"
              height="26"
              rx="5"
              transform="rotate(90 220.5 181)"
              stroke="#9CA0B0"
              strokeWidth="2"
            />
            <g filter="url(#filter0_b_1438_225203)">
              <rect
                x="141.5"
                y="38"
                width="132"
                height="132"
                rx="66"
                fill="white"
                fillOpacity="0.1"
              />
              <rect
                x="142.5"
                y="39"
                width="130"
                height="130"
                rx="65"
                stroke="#9CA0B0"
                strokeWidth="2"
              />
            </g>
            <defs>
              <filter
                id="filter0_b_1438_225203"
                x="117.5"
                y="14"
                width="180"
                height="180"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feGaussianBlur in="BackgroundImageFix" stdDeviation="12" />
                <feComposite
                  in2="SourceAlpha"
                  operator="in"
                  result="effect1_backgroundBlur_1438_225203"
                />
                <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="effect1_backgroundBlur_1438_225203"
                  result="shape"
                />
              </filter>
              <clipPath id="clip0_1438_225203">
                <rect
                  width="16"
                  height="16"
                  fill="white"
                  transform="translate(289.5 96.082)"
                />
              </clipPath>
              <clipPath id="clip1_1438_225203">
                <rect
                  width="16"
                  height="16"
                  fill="white"
                  transform="translate(335.5 96.082)"
                />
              </clipPath>
            </defs>
          </svg>
        </div>
      </div>
    );
  }
);

export default TxConfirmationRing;
