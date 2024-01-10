import { ArrowRightUp } from '@webb-tools/icons';
import { Typography } from '@webb-tools/webb-ui-components';
import { FEEDBACK_URL } from '../constants';
import { LinkCard } from './LinkCard';

export const FeedbackCard = () => {
  return (
    <LinkCard isExternal href={FEEDBACK_URL}>
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
