import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';

export default function ViewTxOnExplorer({
  url,
  children,
}: { url?: string; children?: string } = {}) {
  if (url === undefined) return null;

  return (
    <Typography variant="body1">
      {children !== undefined ? `${children}. ` : ``}View the transaction{' '}
      <Button
        className="inline-block"
        variant="link"
        href={url?.toString()}
        target="_blank"
      >
        on the explorer
      </Button>
    </Typography>
  );
}
