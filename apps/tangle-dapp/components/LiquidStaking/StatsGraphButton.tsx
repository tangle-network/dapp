import { LineChartIcon } from '@webb-tools/icons';
import { Button } from '@webb-tools/webb-ui-components';

export const StatsGraphButton = ({ href }: { href: string }) => {
  return (
    <Button
      variant="utility"
      className="bg-blue-0 dark:bg-blue-120"
      onClick={() => window.open(href, '_blank')}
    >
      <LineChartIcon
        width={16}
        height={16}
        className="fill-blue-60 dark:fill-blue-40"
      />
    </Button>
  );
};
