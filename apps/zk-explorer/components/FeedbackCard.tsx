import { ArrowRightUp } from '@webb-tools/icons';
import { Typography } from '@webb-tools/webb-ui-components';
import { WEBB_DAPP_NEW_ISSUE_URL } from '@webb-tools/webb-ui-components/constants';
import { LinkCard } from './LinkCard';

export const FeedbackCard = () => {
  return (
    <LinkCard isExternal href={WEBB_DAPP_NEW_ISSUE_URL}>
      <div className="mb-4">
        <Typography variant="h5" fw="bold">
          Feedback
        </Typography>

        <Typography variant="h5" className="dark:text-mono-100" fw="normal">
          Have feedback? Reach out to share your thoughts & suggestions!
        </Typography>
      </div>

      <ArrowRightUp size="lg" />
    </LinkCard>
  );
};
