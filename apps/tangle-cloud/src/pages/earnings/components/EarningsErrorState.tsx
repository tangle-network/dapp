import { FC } from 'react';
import { Card, CardVariant, Typography } from '@tangle-network/ui-components';
import ErrorMessage from '@tangle-network/tangle-shared-ui/components/ErrorMessage';
import { type DeveloperPaymentsDiagnostics } from '@tangle-network/tangle-shared-ui/data/graphql';

interface EarningsErrorStateProps {
  error?: unknown;
  unsupportedSchemaMessage?: string | null;
  diagnostics?: DeveloperPaymentsDiagnostics;
}

const EarningsErrorState: FC<EarningsErrorStateProps> = ({
  error,
  unsupportedSchemaMessage,
  diagnostics,
}) => {
  const isUnsupportedSchema = Boolean(unsupportedSchemaMessage);
  const hasMismatch = diagnostics?.hasLikelyEndpointMismatch === true;

  return (
    <Card variant={CardVariant.GLASS} className="p-6">
      <Typography variant="h5" fw="bold" className="mb-3">
        {isUnsupportedSchema
          ? 'Earnings Unavailable on Current Indexer Schema'
          : 'Could Not Load Earnings'}
      </Typography>

      <ErrorMessage>
        {isUnsupportedSchema
          ? unsupportedSchemaMessage
          : error instanceof Error
            ? error.message
            : 'Failed to load developer payouts.'}
      </ErrorMessage>

      {diagnostics && (
        <div className="mt-4 space-y-1">
          <Typography variant="body2" className="text-mono-100">
            Expected indexer network: {diagnostics.expectedNetwork}
          </Typography>
          <Typography variant="body2" className="text-mono-100 break-all">
            Endpoint: {diagnostics.endpoint}
          </Typography>
          {hasMismatch && (
            <Typography variant="body2" className="text-red-400">
              Endpoint appears to target `{diagnostics.endpointNetwork}` while
              wallet chain expects `{diagnostics.expectedNetwork}`.
            </Typography>
          )}
        </div>
      )}
    </Card>
  );
};

export default EarningsErrorState;
