import { Button, Typography } from '@webb-tools/webb-ui-components';
import { RECIPIENT_PUBLIC_KEY_DOCS_URL } from '../../constants/index.js';

export const RecipientPublicKeyTooltipContent = () => (
  <div className="py-2">
    <Typography variant="body1" fw="bold">
      Recipient public key
    </Typography>

    <Typography variant="body1" className="mt-2 break-normal max-w-[280px]">
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
