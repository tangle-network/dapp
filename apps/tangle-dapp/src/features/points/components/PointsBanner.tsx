import {
  EMPTY_VALUE_PLACEHOLDER,
  SkeletonLoader,
  Typography,
} from '@tangle-network/ui-components';
import addCommasToNumber from '@tangle-network/ui-components/utils/addCommasToNumber';
import cx from 'classnames';
import { SVGProps } from 'react';
import useActiveAccountPoints from '../data/useActiveAccountPoints';
import { ArrowRightUp } from '@tangle-network/icons';

const LEADERBOARD_URL = 'https://leaderboard.tangle.tools';

export const PointsBanner = () => {
  const { data, error, isPending } = useActiveAccountPoints();

  return (
    <div
      className={cx(
        'space-y-4 p-4 rounded-xl',
        'bg-cover bg-no-repeat object-fill',
        "bg-[url('/static/assets/xp-banner-bg.png')]",
        "dark:bg-[url('/static/assets/xp-banner-bg-dark.png')]",
      )}
    >
      <XPIcon width={36} height={36} />

      <div>
        {isPending && !data ? (
          <SkeletonLoader className="h-6 w-12 mb-1" />
        ) : error ? (
          <Typography variant="body1" fw="bold">
            Error: {error.message}
          </Typography>
        ) : (
          <Typography variant="body1" fw="bold" className="!text-mono-0">
            {data === undefined
              ? EMPTY_VALUE_PLACEHOLDER
              : addCommasToNumber(data)}
          </Typography>
        )}

        <Typography variant="body2" fw="bold" className="!text-mono-0">
          Points Earned
        </Typography>

        <a
          href={LEADERBOARD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={cx(
            'flex items-center justify-center gap-1',
            'backdrop-blur-[5px] py-2 text-center w-full block rounded-xl !text-mono-0 mt-1.5',
            '[background:_linear-gradient(126.97deg,_rgba(6,_11,_40,_0.74)_28.26%,_rgba(10,_14,_35,_0.71)_91.2%)]',
            'body4 font-bold uppercase',
          )}
        >
          Leaderboard{' '}
          <ArrowRightUp className="fill-current dark:fill-current" />
        </a>
      </div>
    </div>
  );
};

const XPIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <g clipPath="url(#a)">
      <path
        fill="url(#b)"
        d="M23 15.338V8.662a5.218 5.218 0 0 0-2.555-4.505L14.552.696a5.028 5.028 0 0 0-5.104 0L3.555 4.157A5.218 5.218 0 0 0 1 8.662v6.676c0 1.859.974 3.576 2.555 4.505l5.893 3.461a5.028 5.028 0 0 0 5.104 0l5.893-3.461A5.217 5.217 0 0 0 23 15.338Z"
      />
      <path
        fill="url(#c)"
        fillRule="evenodd"
        d="M21.5 15.338V8.662c0-1.336-.7-2.556-1.815-3.211l-5.893-3.462a3.528 3.528 0 0 0-3.584 0L4.315 5.451A3.718 3.718 0 0 0 2.5 8.66v6.678c0 1.335.7 2.556 1.815 3.21l5.893 3.462a3.528 3.528 0 0 0 3.584 0l5.893-3.462a3.718 3.718 0 0 0 1.815-3.21ZM23 8.662v6.676a5.218 5.218 0 0 1-2.555 4.505l-5.893 3.461a5.028 5.028 0 0 1-5.104 0l-5.893-3.461A5.217 5.217 0 0 1 1 15.338V8.662c0-1.859.974-3.576 2.555-4.505L9.448.696a5.028 5.028 0 0 1 5.104 0l5.893 3.461A5.218 5.218 0 0 1 23 8.662Z"
        clipRule="evenodd"
      />
      <g filter="url(#d)">
        <path
          fill="#171717"
          fillOpacity={0.4}
          d="m8.473 13.793-2.268-3.416h1.419l.83 1.223c.28.42.514.812.766 1.279l1.587-2.502h1.39l-2.23 3.407 2.24 3.416h-1.41l-.765-1.13a19.444 19.444 0 0 1-.812-1.362L7.559 17.2h-1.4l2.314-3.407Zm7.426 1.055h-1.502V17.2h-1.195v-6.823H15.9c1.373 0 2.26.896 2.26 2.231 0 1.316-.897 2.24-2.26 2.24Zm-.233-3.407h-1.27v2.343h1.252c.82 0 1.26-.439 1.26-1.185 0-.747-.449-1.158-1.242-1.158Z"
          shapeRendering="crispEdges"
        />
      </g>
      <g filter="url(#e)">
        <path
          fill="#fff"
          d="M8.473 12.593 6.205 9.177h1.419l.83 1.223c.28.42.514.812.766 1.279l1.587-2.502h1.39l-2.23 3.407L12.207 16h-1.41l-.765-1.13a19.446 19.446 0 0 1-.812-1.362L7.559 16h-1.4l2.314-3.407Zm7.426 1.055h-1.502V16h-1.195V9.177H15.9c1.373 0 2.26.896 2.26 2.231 0 1.316-.897 2.24-2.26 2.24Zm-.233-3.407h-1.27v2.343h1.252c.82 0 1.26-.439 1.26-1.185 0-.747-.449-1.158-1.242-1.158Z"
        />
      </g>
    </g>
    <defs>
      <linearGradient
        id="b"
        x1={23}
        x2={1}
        y1={12}
        y2={12}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#5953F9" />
        <stop offset={1} stopColor="#8195F6" />
      </linearGradient>
      <linearGradient
        id="c"
        x1={12}
        x2={12}
        y1={0}
        y2={24}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#fff" stopOpacity={0.48} />
        <stop offset={1} stopColor="#fff" stopOpacity={0} />
      </linearGradient>
      <filter
        id="d"
        width={412}
        height={406.823}
        x={-73.842}
        y={-69.623}
        colorInterpolationFilters="sRGB"
        filterUnits="userSpaceOnUse"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          result="hardAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        />
        <feOffset dx={120} dy={120} />
        <feGaussianBlur stdDeviation={100} />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" />
        <feBlend
          in2="BackgroundImageFix"
          result="effect1_dropShadow_5320_66856"
        />
        <feBlend
          in="SourceGraphic"
          in2="effect1_dropShadow_5320_66856"
          result="shape"
        />
      </filter>
      <filter
        id="e"
        width={412}
        height={406.823}
        x={-73.842}
        y={-70.823}
        colorInterpolationFilters="sRGB"
        filterUnits="userSpaceOnUse"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          result="hardAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        />
        <feOffset dx={120} dy={120} />
        <feGaussianBlur stdDeviation={100} />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" />
        <feBlend
          in2="BackgroundImageFix"
          result="effect1_dropShadow_5320_66856"
        />
        <feBlend
          in="SourceGraphic"
          in2="effect1_dropShadow_5320_66856"
          result="shape"
        />
      </filter>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h24v24H0z" />
      </clipPath>
    </defs>
  </svg>
);
