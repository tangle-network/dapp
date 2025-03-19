import { Button, Typography } from '@tangle-network/ui-components';
import { FC } from 'react';
import { ArrowRight } from '@tangle-network/icons';
import { Link } from 'react-router';

const NotFoundPage: FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full max-w-xl mx-auto gap-7">
      <div className="space-y-3">
        <Typography variant="h3" className="text-center">
          Page Not Found
        </Typography>

        <Typography variant="body1" className="text-center">
          Hmm... We've looked far and wide but could not find the requested
          page. Please check the URL path for typos.
        </Typography>
      </div>

      <Link to="/">
        <Button rightIcon={<ArrowRight />}>Go to Dashboard</Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
