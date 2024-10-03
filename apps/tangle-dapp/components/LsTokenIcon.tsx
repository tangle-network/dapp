import { TokenIcon } from '@webb-tools/icons';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

type LsTokenIconSize = 'md' | 'lg';

interface LsTokenIconProps {
  name?: string;
  size?: LsTokenIconSize;
  hasTangleBorder?: boolean;
}

const LsTokenIcon: FC<LsTokenIconProps> = ({
  name,
  size = 'md',
  hasTangleBorder = true,
}) => {
  const { wrapperSizeClassName, iconSizeClassName, borderSize } =
    getSizeValues(size);

  // TODO: Positioning of the logo is not 100% centered; a few pixels off. Avoid using absolute positioning for the logo to fix this.
  return (
    <div
      className={twMerge(
        'relative flex items-center justify-center',
        wrapperSizeClassName,
      )}
    >
      {name !== undefined && (
        <TokenIcon
          name={name}
          className={twMerge(
            'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full',
            iconSizeClassName,
          )}
          customLoadingCmp={
            <div
              className={twMerge(
                'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
                'z-10 rounded-full bg-mono-60 dark:bg-mono-140',
                size === 'md' ? 'h-[25px] w-[25px]' : 'h-[50px] w-[50px]',
              )}
            />
          }
        />
      )}

      <svg
        width={borderSize}
        height={borderSize}
        viewBox="0 0 25 26"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          id="border"
          cx="12.5"
          cy="13"
          r="11.875"
          stroke="url(#paint0_linear_257_3557)"
          strokeWidth="1.25"
        />

        <defs>
          <linearGradient
            id="paint0_linear_257_3557"
            x1="1.58333"
            y1="23.6374"
            x2="23.3337"
            y2="1.88742"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#8E59FF" />
            <stop offset="1" stopColor="#6888F9" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default LsTokenIcon;

function getSizeValues(size: LsTokenIconSize): {
  wrapperSizeClassName: string;
  iconSizeClassName: string;
  borderSize: number;
} {
  switch (size) {
    case 'md':
      return {
        wrapperSizeClassName: 'w-[25px] h-[25px]',
        iconSizeClassName: 'w-5 h-5',
        borderSize: 25,
      };
    case 'lg':
      return {
        wrapperSizeClassName: 'w-[50px] h-[50px]',
        iconSizeClassName: 'w-10 h-10',
        borderSize: 50,
      };
  }
}
