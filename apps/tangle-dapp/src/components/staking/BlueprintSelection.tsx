import { FC } from 'react';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { Card, CardVariant } from '@tangle-network/ui-components';
import type { Address } from 'viem';

interface Props {
  operatorAddress: Address | null;
}

const BlueprintSelection: FC<Props> = ({ operatorAddress }) => {
  if (!operatorAddress) {
    return null;
  }

  return (
    <Card variant={CardVariant.GLASS} className="p-4">
      <Typography variant="body2" className="text-mono-100">
        Blueprint selection will be available soon. Delegation will
        automatically apply to all blueprints the operator supports.
      </Typography>
    </Card>
  );
};

export default BlueprintSelection;
