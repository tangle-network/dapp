import { FC } from 'react';
import { Card, CardContent } from '@tangle-network/sandbox-ui/primitives';
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
    <Card variant="sandbox">
      <CardContent className="p-6">
        <h2 className="mb-3 font-display font-bold text-foreground text-xl">
          {isUnsupportedSchema
            ? 'Earnings Unavailable on Current Indexer Schema'
            : 'Could Not Load Earnings'}
        </h2>

        <ErrorMessage>
          {isUnsupportedSchema
            ? unsupportedSchemaMessage
            : error instanceof Error
              ? error.message
              : 'Failed to load developer payouts.'}
        </ErrorMessage>

        {diagnostics && (
          <div className="mt-4 space-y-1 text-muted-foreground text-sm">
            <p>Expected indexer network: {diagnostics.expectedNetwork}</p>
            <p className="break-all">Endpoint: {diagnostics.endpoint}</p>
            {hasMismatch && (
              <p className="text-destructive">
                Endpoint appears to target `{diagnostics.endpointNetwork}` while
                wallet chain expects `{diagnostics.expectedNetwork}`.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EarningsErrorState;
