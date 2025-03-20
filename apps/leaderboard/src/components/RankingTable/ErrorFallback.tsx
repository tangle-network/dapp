import Button from '@tangle-network/ui-components/components/buttons/Button';
import { GITHUB_BUG_REPORT_URL } from '@tangle-network/ui-components/constants';
import { UIErrorBoundaryState } from '@tangle-network/ui-components/containers/UIErrorBoundary/types';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import type { FC } from 'react';

type Props = UIErrorBoundaryState;

export const ErrorFallback: FC<Props> = ({ error }) => {
  return (
    <Typography variant="mkt-body2" fw="semibold" ta="center">
      {error ? (
        error.message
      ) : (
        <>
          Encountered an error while parsing the response from the server.
          Please{' '}
          <Button
            variant="link"
            target="_blank"
            href={GITHUB_BUG_REPORT_URL}
            rel="noreferrer noopener"
            className="inline-block"
          >
            report bug
          </Button>
        </>
      )}
    </Typography>
  );
};
