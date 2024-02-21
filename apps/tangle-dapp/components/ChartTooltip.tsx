import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { TooltipProps } from 'recharts';
import {
  NameType,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent';

const ChartTooltip = <TValue extends ValueType, TName extends NameType>({
  active,
  payload,
}: TooltipProps<TValue, TName>) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <ul className="px-4 py-2 rounded-lg bg-mono-0 dark:bg-mono-180 text-mono-120 dark:text-mono-80">
      {payload.map((entry) => (
        <li key={entry.name}>
          <Typography variant="body2" fw="semibold">
            {entry.name}: {entry.value}
          </Typography>
        </li>
      ))}
    </ul>
  );
};

export default ChartTooltip;
