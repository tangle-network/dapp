import { InfoIcon } from '@webb-dapp/ui-components/AlertCard/icons';
import { Typography } from '@webb-dapp/webb-ui-components/typography';
import { FC, useMemo } from 'react';
type DisclaimerVariant = 'Error' | 'Warning' | 'Info' | 'Success';
export const Disclaimer: FC<{ variant: DisclaimerVariant }> = ({ variant }) => {
  const typographyClasses = useMemo(() => {
    switch (variant) {
      case 'Error':
        return 'text-red-500';
      case 'Warning':
        return 'text-yellow-500';
      case 'Info':
        return 'text-sky-500';
      case 'Success':
        return 'text-green-500';
    }
  }, [variant]);
  return (
    <div className={'rounded-xl p-3 border-2 border-mono-80 flex items-stretch'}>
      <div className={'w-12 h-12  '}>
        <InfoIcon color={'#3D7BCE'} />
      </div>
      <div className={'px-2'}>
        <Typography variant={'body3'} fw={'bold'} className={typographyClasses}>
          New spend note is added to your account to reflect updated balance on Webb.
        </Typography>
      </div>
    </div>
  );
};
