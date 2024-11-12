import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import Header from '../components/Header';

export default function Index() {
  return (
    <div className="max-w-screen-xl mx-auto">
      <Header />

      <Typography
        variant="h3"
        ta="center"
        className="flex items-center justify-center min-h-full"
      >
        Hello there, Welcome tangle-cloud 👋
      </Typography>
    </div>
  );
}
