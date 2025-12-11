import { FC } from 'react';
import { Card, CardVariant, Typography } from '@tangle-network/ui-components';

interface Props {
  operatorConcentration?: Map<string, number | null>;
  operatorMap: Map<string, unknown>;
  operatorTvl?: Map<string, number | null>;
  onRestakeClicked: () => void;
  onRestakeClickedPagePath: string;
  onRestakeClickedQueryParamKey: string;
  isLoading?: boolean;
  onOperatorJoined?: () => void;
}

const OperatorsTableContainer: FC<Props> = ({ isLoading }) => {
  if (isLoading) {
    return (
      <Card variant={CardVariant.GLASS} className="p-6 text-center">
        <Typography variant="body1">Loading operators...</Typography>
      </Card>
    );
  }

  return (
    <Card variant={CardVariant.GLASS} className="p-6 text-center">
      <Typography variant="body1" className="text-mono-120 dark:text-mono-80">
        Operators table is being migrated to EVM. Please use the Tangle dApp for
        operator management.
      </Typography>
    </Card>
  );
};

export default OperatorsTableContainer;
