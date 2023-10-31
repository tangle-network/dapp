import { type FC } from 'react';
import { Typography } from '../../typography';
import { IconWithTooltip } from '../../components/IconWithTooltip';
import {
  CornerDownRightLine,
  FileShieldLine,
  InformationLine,
} from '@webb-tools/icons';

interface AmountInfoProps {
  label: string;
  amount: number | string;
  tokenSymbol: string;
  tooltipContent?: string;
}

const AmountInfo: FC<AmountInfoProps> = ({
  label,
  amount,
  tokenSymbol,
  tooltipContent,
}) => {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center gap-0.5">
        <CornerDownRightLine className="fill-mono-120 dark:fill-mono-100" />
        <FileShieldLine className="fill-mono-120 dark:fill-mono-100" />

        <Typography
          variant="utility"
          className="text-mono-120 dark:text-mono-100"
        >
          {label}
        </Typography>

        {tooltipContent && (
          <IconWithTooltip
            icon={
              <InformationLine className="fill-mono-120 dark:fill-mono-100" />
            }
            content={
              <Typography variant="body3" className="break-normal max-w-max">
                {tooltipContent}
              </Typography>
            }
            overrideTooltipBodyProps={{ className: 'max-w-[200px]' }}
          />
        )}
      </div>
      <Typography
        variant="body1"
        fw="bold"
        className="text-mono-190 dark:text-mono-40"
      >
        {amount} {tokenSymbol}
      </Typography>
    </div>
  );
};

export default AmountInfo;
