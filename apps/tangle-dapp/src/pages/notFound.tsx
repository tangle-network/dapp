import { Button, Typography } from '@tangle-network/webb-ui-components';
import { PagePath } from '../types';
import { FC } from 'react';
import { ArrowRight } from '@tangle-network/icons';
import { Link } from 'react-router';

const NotFoundPage: FC = () => {
  return (
    <div className="flex flex-col items-center justify-center max-w-xl gap-7 h-full mx-auto">
      <div className="space-y-3">
        <Typography variant="h3" className="text-center">
          Page Not Found
        </Typography>

        <Typography variant="body1" className="text-center">
          Hmm... We've looked far and wide but could not find the requested
          page. Please check the URL path for typos.
        </Typography>
      </div>

      <Link to={PagePath.DASHBOARD}>
        <Button rightIcon={<ArrowRight />}>Go to Dashboard</Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
