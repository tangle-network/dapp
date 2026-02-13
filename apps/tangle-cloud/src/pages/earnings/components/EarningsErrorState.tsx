import { FC } from 'react';
import { Card, CardVariant, Typography } from '@tangle-network/ui-components';
import ErrorMessage from '@tangle-network/tangle-shared-ui/components/ErrorMessage';

interface EarningsErrorStateProps {
  error: unknown;
}

const EarningsErrorState: FC<EarningsErrorStateProps> = ({ error }) => {
  return (
    <Card variant={CardVariant.GLASS} className="p-6">
      <Typography variant="h5" fw="bold" className="mb-3">
        Could Not Load Earnings
      </Typography>
      <ErrorMessage>
        {error instanceof Error
          ? error.message
          : 'Failed to load developer payouts.'}
      </ErrorMessage>
    </Card>
  );
};

export default EarningsErrorState;
