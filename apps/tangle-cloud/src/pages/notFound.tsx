import { Button, Text } from '../components/sandbox/SandboxUi';
import { PagePath } from '../types';
import { FC } from 'react';
import { Link } from 'react-router';

const NotFoundPage: FC = () => {
  return (
    <div className="flex flex-col items-center justify-center max-w-xl gap-7 h-full mx-auto">
      <div className="space-y-3">
        <Text variant="h4" className="text-center">
          Page Not Found
        </Text>

        <Text variant="body1" className="text-center">
          Hmm... We've looked far and wide but could not find the requested
          page. Please check the URL path for typos.
        </Text>
      </div>

      <Link to={PagePath.HOME}>
        <Button>Go Home</Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
