import isDefined from '@webb-tools/dapp-types/utils/isDefined';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { PropsWithChildren } from 'react';

export default function ViewTxOnExplorer({
  url,
  children,
}: PropsWithChildren<{ url?: string }> = {}) {
  if (url === undefined) return null;

  return (
    <Typography component="div" variant="body1">
      {children}
      {url && (
        <>
          {isDefined(children) && '. '}View the transaction{' '}
          <Button
            className="inline-block"
            variant="link"
            href={url?.toString()}
            target="_blank"
          >
            on the explorer
          </Button>
        </>
      )}
    </Typography>
  );
}
