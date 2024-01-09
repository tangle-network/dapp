import { ArrowRightUp } from '@webb-tools/icons';
import { Typography } from '@webb-tools/webb-ui-components';
import { LinkCard } from './LinkCard';

export const FeedbackCard = () => {
  return (
    // TODO: Replace this with a link to the feedback form. If this takes to an external page, need to add a prop to `LinkCard` to not use `next/link`, but instead use `a` tag.
    <LinkCard href="#">
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
