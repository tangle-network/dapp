import { forwardRef, useCallback } from 'react';
import cx from 'classnames';
import { ChainIcon } from '@webb-tools/icons';
import { chainsConfig } from '@webb-tools/dapp-config/chains/chain-config';

import { Tooltip, TooltipBody, TooltipTrigger } from '../Tooltip';
import {
  useDarkMode as useNormalDarkMode,
  useNextDarkMode,
} from '../../hooks/useDarkMode';
import type { ChainsRingProps, ChainRingItemType } from './types';

const ChainsRing = forwardRef<HTMLDivElement, ChainsRingProps>(
  ({ circleContent, additionalSvgContent, chainItems, isInNextApp }, ref) => {
    const useDarkMode = isInNextApp ? useNextDarkMode : useNormalDarkMode;
    const [isDarkMode] = useDarkMode();

    const getStrokeColor = useCallback(
      (item?: ChainRingItemType) => {
        if (item === undefined) return '#9CA0B0';
        return item.isActive ? (isDarkMode ? '#4B3AA4' : '#B5A9F2') : '#9CA0B0';
      },
      [isDarkMode]
    );

    return (
      <div className="relative w-fit" ref={ref}>
        {chainItems.map((chainItem, idx) => {
          if (chainItem === undefined) {
            return null;
          }

          const { typedChainId, onClick } = chainItem;

          if (typedChainId === undefined) {
            return null;
          }

          const chainName = chainsConfig[typedChainId].name;

          return (
            <Tooltip key={`${typedChainId}-${idx}`}>
              <TooltipTrigger className="cursor-pointer" asChild>
                <div
                  className={getChainIconClassNameByIdx(idx)}
                  onClick={onClick}
                >
                  <ChainIcon name={chainName} size="lg" />
                </div>
              </TooltipTrigger>
              <TooltipBody className="z-20">{chainName}</TooltipBody>
            </Tooltip>
          );
        })}

        <div
          className={cx(
            'absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]',
            'bg-mono-0 dark:bg-[rgba(247,248,247,0.10)]',
            'aspect-square w-[128px] px-4 rounded-full',
            'flex justify-center items-center'
          )}
          style={{ backdropFilter: 'blur(12px)' }}
        >
          {circleContent}
        </div>

        <svg
          width="415"
          height="208"
          viewBox="0 0 415 208"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {additionalSvgContent}
          <rect
            x="104.5"
            y="91.082"
            width="26"
            height="26"
            rx="5"
            stroke={getStrokeColor(chainItems[0])}
            strokeWidth="2"
          />
          <rect
            x="143.471"
            y="21.5858"
            width="26"
            height="26"
            rx="5"
            transform="rotate(45 143.471 21.5858)"
            stroke={getStrokeColor(chainItems[1])}
            strokeWidth="2"
          />
          <rect
            x="220.5"
            y="1"
            width="26"
            height="26"
            rx="5"
            transform="rotate(90 220.5 1)"
            stroke={getStrokeColor(chainItems[2])}
            strokeWidth="2"
          />
          <rect
            x="288.885"
            y="39.9688"
            width="26"
            height="26"
            rx="5"
            transform="rotate(135 288.885 39.9688)"
            stroke={getStrokeColor(chainItems[3])}
            strokeWidth="2"
          />
          <rect
            x="284.5"
            y="91.082"
            width="26"
            height="26"
            rx="5"
            stroke={getStrokeColor(chainItems[4])}
            strokeWidth="2"
          />
          <rect
            x="270.75"
            y="148.863"
            width="26"
            height="26"
            rx="5"
            transform="rotate(45 270.75 148.863)"
            stroke={getStrokeColor(chainItems[5])}
            strokeWidth="2"
          />
          <rect
            x="220.5"
            y="181"
            width="26"
            height="26"
            rx="5"
            transform="rotate(90 220.5 181)"
            stroke={getStrokeColor(chainItems[6])}
            strokeWidth="2"
          />
          <rect
            x="161.606"
            y="167.25"
            width="26"
            height="26"
            rx="5"
            transform="rotate(135 161.606 167.25)"
            stroke={getStrokeColor(chainItems[7])}
            strokeWidth="2"
          />
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
            x="270.75"
            y="150.277"
            width="24"
            height="24"
            transform="rotate(45 270.75 150.277)"
            fill="#F7F8F7"
            fillOpacity="0.1"
          />
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
            x="160.191"
            y="167.25"
            width="24"
            height="24"
            transform="rotate(135 160.191 167.25)"
            fill="#F7F8F7"
            fillOpacity="0.1"
          />
          <rect
            x="105.5"
            y="92.277"
            width="24"
            height="24"
            fill="#F7F8F7"
            fillOpacity="0.1"
          />
          <rect
            x="285.5"
            y="92.277"
            width="24"
            height="24"
            fill="#F7F8F7"
            fillOpacity="0.1"
          />
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
            x="219.5"
            y="182"
            width="24"
            height="24"
            transform="rotate(90 219.5 182)"
            fill="#F7F8F7"
            fillOpacity="0.1"
          />
          <path
            d="M144.243 40.7431L207.5 14.5412L270.757 40.7431L296.959 104L270.757 167.257L207.5 193.459L144.243 167.257L118.041 104L144.243 40.7431Z"
            stroke="#C2C8D4"
          />
          <path d="M207.5 14V194" stroke="#E2E5EB" />
          <path d="M143.471 39.9688L270.75 167.248" stroke="#9CA0B0" />
          <path d="M270.5 39.9688L143.221 167.248" stroke="#9CA0B0" />
          <path d="M117.5 104.082L297.5 104.082" stroke="#9CA0B0" />
          <path d="M207.5 14V194" stroke="#9CA0B0" />
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
    );
  }
);

export default ChainsRing;

/** @internal */
function getChainIconClassNameByIdx(idx: number) {
  const baseClassName = 'absolute';
  let positionClassName = '';
  // update className based on idx (0-7)
  switch (idx % 8) {
    case 0:
      positionClassName = 'top-1/2 translate-y-[-50%] left-[105.5px]';
      break;
    case 1:
      positionClassName =
        'rotate-45 top-[40px] translate-y-[-50%] left-[131.5px]';
      break;
    case 2:
      positionClassName = 'top-[2px] translate-x-[50%] right-1/2';
      break;
    case 3:
      positionClassName =
        '-rotate-45 top-[40px] translate-y-[-50%] right-[132.5px]';
      break;
    case 4:
      positionClassName = 'top-1/2 translate-y-[-50%] right-[105.5px]';
      break;
    case 5:
      positionClassName =
        '-rotate-45 bottom-[16.75px] translate-y-[-50%] right-[132.2575px]';
      break;
    case 6:
      positionClassName = 'bottom-[2px] translate-x-[50%] right-1/2';
      break;
    case 7:
      positionClassName =
        'rotate-45 bottom-[17px] translate-y-[-50%] left-[131.5px]';
      break;
    default:
      break;
  }

  return `${baseClassName} ${positionClassName}`;
}
