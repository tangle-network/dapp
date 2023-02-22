import { Spinner } from '@webb-tools/icons';
import { Typography } from '@webb-tools/webb-ui-components';
import { useEffect, useState } from 'react';

export const LoadingTable = () => {
  return (
    <div className="h-[511px] bg-mono-0 dark:bg-mono-160 rounded-lg flex items-center justify-center">
      <div>
        <div className="flex justify-center">
          <Spinner size="lg" className="mb-2" />
        </div>

        <Typography variant="h5" ta="center" fw="bold">
          Syncing notes
        </Typography>

        <LoadingText />
      </div>
    </div>
  );
};

/***********************
 * Internal components *
 ***********************/

const LoadingText = () => {
  // State for number of dots for loading
  const [dots, setDots] = useState(1);

  // Update dots every 500ms
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((dots) => (dots === 3 ? 1 : dots + 1));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <Typography variant="body2" fw="semibold" className="!text-mono-100">
      Please wait a few minutes{`...`.slice(0, dots)}
    </Typography>
  );
};
