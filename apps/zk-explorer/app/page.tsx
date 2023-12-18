import { Card, Typography } from '@webb-tools/webb-ui-components';
import { ArrowRightUp } from '@webb-tools/icons';
import { ProjectSubmissionControls } from '../components/ProjectSubmissionControls';

export default function Index() {
  return (
    <main className="flex flex-col gap-6 pt-6">
      <Typography variant="h4" fw="bold">
        Upload Project
      </Typography>

      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <Card className="max-w-[780px]">
          <Typography variant="h5">GitHub Repository URL:</Typography>

          <ProjectSubmissionControls />
        </Card>

        <Card className="p-6 shadow-md space-y-4 w-auto">
          <div>
            <Typography variant="h5">Feedback</Typography>

            <Typography variant="h5" className="dark:text-mono-100" fw="normal">
              Have feedback? Reach out to share your thoughts & suggestions!
            </Typography>
          </div>

          <a href="#">
            <ArrowRightUp size="lg" />
          </a>
        </Card>
      </div>
    </main>
  );
}
