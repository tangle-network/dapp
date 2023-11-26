'use client';

import Button from '@webb-tools/webb-ui-components/components/buttons/Button';

const CTAButtons = () => {
  return (
    <div className="flex items-center justify-center gap-4">
      <Button variant="secondary" href="#" className="px-5 md:px-9">
        View Guidelines
      </Button>
      <Button href="#" className="px-5 md:px-9">
        Request Points
      </Button>
    </div>
  );
};

export default CTAButtons;
