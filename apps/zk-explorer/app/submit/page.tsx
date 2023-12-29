import { Card, Typography } from '@webb-tools/webb-ui-components';
import { ArrowRightUp } from '@webb-tools/icons';
import { LinkCard } from '../../components/LinkCard';
import { SubmitPageControls } from '../../components/SubmitPageControls';

export default function Submit() {
  return (
    <main className="flex flex-col gap-6 pt-6">
      <Typography variant="h4" fw="bold">
        Upload Project
      </Typography>

      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <Card className="max-w-[780px]">
          <Typography variant="h5">GitHub Repository URL:</Typography>

          <SubmitPageControls />
        </Card>

        {/* TODO: Replace this with a link to the feedback form. */}
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
      </div>
    </main>
  );
}
