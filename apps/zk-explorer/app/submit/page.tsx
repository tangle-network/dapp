import { Card, Typography } from '@webb-tools/webb-ui-components';
import { FeedbackCard } from '../../components/FeedbackCard';
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

        <FeedbackCard />
      </div>
    </main>
  );
}
