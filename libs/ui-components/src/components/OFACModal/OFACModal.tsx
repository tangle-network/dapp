import { type FC } from 'react';
import { Button } from '../buttons';
import { Typography } from '../../typography';

import { SOCIAL_URLS_RECORD } from '../../constants';

const contactUs = SOCIAL_URLS_RECORD.telegram;
const reportIssueLink = `${SOCIAL_URLS_RECORD.github}/dapp/issues/new/choose`;

/**
 * Modal to show when user is accessing the website from a country in OFAC list
 */
const OFACModal: FC = () => {
  return (
    <div className="max-w-lg p-6 space-y-4 rounded-lg bg-mono-0 dark:bg-mono-180">
      <Typography variant="h5" fw="black" ta="center">
        OFAC Restricted
      </Typography>

      <div className="flex flex-col items-center w-4/5 gap-4 mx-auto">
        <Typography variant="body2" fw="semibold" ta="center">
          You are accessing the website from a country in Office of Foreign
          Assets Control (OFAC) list. Access to this website is restricted.
        </Typography>

        <div className="inline-block text-center">
          If you find any issue, please{' '}
          <Button
            href={contactUs}
            target="_blank"
            rel="noopener noreferrer"
            variant="link"
            className="inline-block"
          >
            contact us
          </Button>{' '}
          or report the issue.
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        <Button
          onClick={() => window.location.reload()}
          size="sm"
          className="px-3 py-2 rounded-lg"
        >
          Refresh Page
        </Button>
        <Button
          target="_blank"
          rel="noopener noreferrer"
          size="sm"
          href={reportIssueLink}
          variant="secondary"
          className="px-3 py-2 rounded-lg"
        >
          Report Issue
        </Button>
      </div>
    </div>
  );
};

export default OFACModal;
