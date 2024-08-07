import { TokenIcon } from '@webb-tools/icons';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

type LSTTokenSize = 'md' | 'lg';

interface LSTTokenProps {
  name: string;
  size?: LSTTokenSize;
}

const LSTToken: FC<LSTTokenProps> = ({ name, size = 'md' }) => {
  const { wrapperSizeClassName, iconSizeClassName, borderSize } =
    getSizeValues(size);

  return (
    <div
      className={twMerge(
        'relative flex items-center justify-center',
        wrapperSizeClassName,
      )}
    >
      <TokenIcon
        name={name}
        className={twMerge(
          'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
          iconSizeClassName,
        )}
      />
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

export default LSTToken;

function getSizeValues(size: LSTTokenSize): {
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
