import { Button, Typography } from '@webb-tools/webb-ui-components';

const RECIPIENT_PUBLIC_KEY_DOCS_URL =
  'https://docs.webb.tools/docs/dapps/hubble-bridge/usage-guide/transfer/#6-input-recipient-shielded-address';

export const RecipientPublicKeyTooltipContent = () => (
  <div>
    <Typography variant="body3" fw="bold">
      Recipient public key
    </Typography>

    <Typography variant="body3" className="mt-2 break-normal max-w-[185px]">
      {
        "The recipient public key\nrepresents the shielded address linked to the intended recipient's account for the transfer."
      }
    </Typography>

    <Button
      href={RECIPIENT_PUBLIC_KEY_DOCS_URL}
      target="_blank"
      rel="noopener noreferrer"
      size="sm"
      variant="utility"
      className="mt-4 ml-auto"
    >
      Learn more
    </Button>
  </div>
);
