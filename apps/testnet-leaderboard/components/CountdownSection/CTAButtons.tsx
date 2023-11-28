'use client';

import Button from '@webb-tools/webb-ui-components/components/buttons/Button';

import { GUIDELINES_URL, REQUEST_POINTS_URL } from '../../constants';

const CTAButtons = () => {
  return (
    <div className="flex items-center justify-center gap-4">
      <Button
        variant="secondary"
        href={GUIDELINES_URL}
        target="_blank"
        className="px-5 md:px-9"
      >
        View Guidelines
      </Button>
      <Button
        href={REQUEST_POINTS_URL}
        target="_blank"
        className="px-5 md:px-9"
      >
        Request Points
      </Button>
    </div>
  );
};

export default CTAButtons;
