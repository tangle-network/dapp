'use client';

import Button from '@tangle-network/ui-components/components/buttons/Button';
import { GITHUB_BUG_REPORT_URL } from '@tangle-network/ui-components/constants';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import type { FC } from 'react';

type Props = {
  errorMessage?: string;
};

const ParseResponseErrorView: FC<Props> = ({ errorMessage }) => {
  return (
    <Typography variant="mkt-body2" fw="semibold" ta="center">
      {typeof errorMessage === 'string' && errorMessage.length > 0 ? (
        errorMessage
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

export default ParseResponseErrorView;
