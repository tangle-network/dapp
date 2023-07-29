import cx from 'classnames';
import { forwardRef } from 'react';
import { StatusIndicatorProps, StatusVariant } from './types';

const classes: {
  [key in StatusVariant]: {
    indicator: string;
    stroke: string;
  };
} = {
  success: {
    indicator: cx('fill-green-70 dark:fill-green-50'),
    stroke: cx('stroke-[#288E32] dark:stroke-[#4CB457]'),
  },
  warning: {
    indicator: cx('fill-yellow-70 darkcx(:fill-yellow-50'),
    stroke: cx('stroke-[#EAB612] dark:stroke-[#F8D567]'),
  },
  error: {
    indicator: cx('fill-red-70 darkcx(:fill-red-50'),
    stroke: cx('stroke-[#EF570D] dark:stroke-[#FF874D]'),
  },
  info: {
    indicator: cx('fill-blue-70 darkcx(:fill-blue-50'),
    stroke: cx('stroke-[#23579D] dark:stroke-[#23579D]'),
  },
};

const StatusIndicator = forwardRef<SVGSVGElement, StatusIndicatorProps>(
  ({ variant = 'info', size = 12, ...props }, ref) => {
    // We use haft size to make sure the component is corectly centered
    const haftSize = size / 2;

    return (
      <svg
        width={haftSize * 2}
        height={haftSize * 2}
        viewBox={`0 0 ${haftSize * 2} ${haftSize * 2}`}
        fill="none"
        ref={ref}
        {...props}
      >
        <rect
          x={haftSize / 2}
          y={haftSize / 2}
          width={haftSize}
          height={haftSize}
          rx={haftSize / 2}
          className={classes[variant].indicator}
        />
        <rect
          x={haftSize / 4}
          y={haftSize / 4}
          width={haftSize * 1.5}
          height={haftSize * 1.5}
          rx={haftSize * 0.75}
          className={classes[variant].stroke}
          strokeOpacity="0.3"
          strokeWidth={haftSize / 2}
        />
      </svg>
    );
  }
);

export default StatusIndicator;
