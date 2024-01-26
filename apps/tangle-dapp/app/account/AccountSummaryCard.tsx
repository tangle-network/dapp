'use client';

import { SkeletonLoader } from '@webb-tools/webb-ui-components';
import type { PropsOf } from '@webb-tools/webb-ui-components/types';
import type { ElementRef } from 'react';
import { FC, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import Identity from '../../components/Identity';
import useActiveAccountAddress from '../../hooks/useActiveAccountAddress';
import Actions from './Actions';
import TotalBalance from './TotalBalance';

const AccountSummaryCard = forwardRef<ElementRef<'div'>, PropsOf<'div'>>(
  ({ className, ...props }, ref) => {
    const activeAccountAddress = useActiveAccountAddress();

    return (
      <div
        {...props}
        className={twMerge(
          'relative rounded-2xl border-2 p-6',
          'border-mono-0 bg-mono-0/70 dark:border-mono-160 dark:bg-mono-0/5',
          'dark:shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] dark:backdrop-blur-sm',
          'w-full flex items-center md:max-w-[556px]',
          className
        )}
        ref={ref}
      >
        <div className="space-y-6 w-full">
          <header>
            {activeAccountAddress !== null ? (
              <Identity
                address={activeAccountAddress}
                fontWeight="normal"
                label="Address:"
                iconTooltipContent="Account public key"
              />
            ) : (
              <SkeletonLoader size="lg" />
            )}
          </header>

          <TotalBalance />

          <Actions />
        </div>

        <Logo className="absolute top-[50%] translate-y-[-50%] right-0 rounded-br-2xl" />
      </div>
    );
  }
);

AccountSummaryCard.displayName = AccountSummaryCard.name;

/** @internal */
const Logo: FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={twMerge('pointer-events-none', className)}>
      <svg
        width="183"
        height="236"
        viewBox="0 0 183 236"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className="fill-mono-100 dark:fill-[#D3D8E2]"
          opacity="0.8"
          d="M269.893 50.9105C269.905 64.3899 263.783 77.3228 252.871 86.8702C241.959 96.4175 227.149 101.799 211.691 101.834L147.16 101.834C146.754 107.078 146.498 112.441 146.498 118C146.498 123.559 146.242 128.895 145.882 134.166L211.691 134.166C227.015 134.38 241.627 139.839 252.377 149.365C263.126 158.89 269.151 171.719 269.151 185.083C269.151 198.447 263.126 211.276 252.377 220.801C241.627 230.327 227.015 235.786 211.691 236L57.459 236C42.1355 235.786 27.5226 230.327 16.7731 220.801C6.02359 211.276 -0.00100663 198.447 -0.00100647 185.083C-0.00100631 171.719 6.02359 158.89 16.7731 149.365C27.5226 139.839 42.1355 134.38 57.459 134.166L118.075 132.75C122.292 132.75 122.652 123.559 122.652 118C122.652 112.441 122.908 107.105 123.268 101.834L57.459 101.834C42.1355 101.62 27.5226 96.1608 16.7731 86.6354C6.02359 77.1099 -0.00100504 64.2812 -0.00100488 50.917C-0.00100472 37.5528 6.02359 24.7241 16.7731 15.1987C27.5226 5.67321 42.1355 0.214429 57.459 -2.53773e-06L211.691 -6.95276e-07C227.146 0.0347285 241.954 5.41466 252.865 14.9592C263.777 24.5038 269.901 37.4333 269.893 50.9105ZM246.047 185.09C246.051 177.134 242.436 169.503 235.995 163.869C229.554 158.235 220.814 155.06 211.691 155.039L143.356 155.039C140.88 169.936 136.164 184.483 129.328 198.306C126.314 204.294 122.455 209.932 117.841 215.088L211.691 215.088C220.803 215.067 229.535 211.899 235.974 206.276C242.413 200.654 246.035 193.036 246.047 185.09ZM57.459 155.039C48.3195 155.039 39.5542 158.205 33.0915 163.841C26.6289 169.476 22.9982 177.12 22.9982 185.09C22.9982 193.059 26.6289 200.703 33.0915 206.339C39.5542 211.974 48.3195 215.14 57.459 215.14L72.9303 215.14C86.5974 215.14 99.5428 205.7 107.602 189.875C113.118 178.724 117.042 167.025 119.284 155.039L57.459 155.039ZM23.1034 50.9105C23.0994 58.8656 26.7143 66.4972 33.1551 72.1309C39.5959 77.7646 48.3365 80.9403 57.459 80.9611L125.794 80.9611C128.27 66.064 132.986 51.5165 139.822 37.6944C142.836 31.7057 146.695 26.0682 151.309 20.9122L57.459 20.9122C48.3469 20.933 39.6154 24.1015 33.1764 29.7239C26.7373 35.3462 23.1153 42.9644 23.1034 50.9105ZM161.639 46.1249C156.122 57.2756 152.198 68.9754 149.956 80.9611L211.691 80.9611C220.831 80.9611 229.596 77.7951 236.058 72.1595C242.521 66.5239 246.152 58.8804 246.152 50.9105C246.152 42.9405 242.521 35.297 236.058 29.6614C229.596 24.0258 220.831 20.8598 211.691 20.8598L196.22 20.8598C182.613 20.8598 169.667 30.2998 161.639 46.1249Z"
          fillOpacity="0.1"
        />
      </svg>
    </div>
  );
};

export default AccountSummaryCard;
