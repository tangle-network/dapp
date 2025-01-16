import { FC } from 'react';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { twMerge } from 'tailwind-merge';
import { Tooltip, TooltipBody, TooltipTrigger } from './Tooltip';

type Size = 'md';

export type CircularProgressProps = {
  /**
   * Progress value between 0 and 1.
   *
   * @example
   * 0.5 // 50%
   * 1 // 100%
   * 0 // 0%
   * 0.75 // 75%
   * 0.123 // 12.3%
   */
  progress: number;

  size?: Size;
  tooltip?: string;
};

const getSizeClass = (size: Size) => {
  switch (size) {
    case 'md':
      return 'h-5' as const;
    default: {
      const _exhaustive: never = size;

      throw new Error(`Unhandled size: ${_exhaustive}`);
    }
  }
};

export const CircularProgress: FC<CircularProgressProps> = ({
  tooltip,
  progress,
  size = 'md',
}) => {
  const progressComponent = (
    <CircularProgressbar
      className={twMerge('!w-auto', getSizeClass(size))}
      value={progress * 100}
      strokeWidth={15}
    />
  );

  if (tooltip === undefined) {
    return progressComponent;
  }

  return (
    <Tooltip>
      <TooltipTrigger>{progressComponent}</TooltipTrigger>

      <TooltipBody>{tooltip}</TooltipBody>
    </Tooltip>
  );
};
