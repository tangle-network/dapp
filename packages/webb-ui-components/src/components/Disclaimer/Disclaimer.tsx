import { InfoIcon } from '@webb-dapp/ui-components/AlertCard/icons';
import { Typography } from '@webb-dapp/webb-ui-components/typography';
import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { AlertVariant } from '@webb-dapp/ui-components/AlertCard/types';
type DisclaimerVariant = AlertVariant;

export const Disclaimer: FC<{ variant: DisclaimerVariant }> = ({ variant }) => {
  const typographyClasses = useMemo(() => {
    switch (variant) {
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'info':
        return 'text-sky-500';
      case 'success':
        return 'text-green-500';
    }
  }, [variant]);
  return (
    <div className={'rounded-xl p-3 border-2 border-mono-80 flex items-stretch'}>
      <div className={'w-12 h-12  '}>
        <InfoIcon color={'#3D7BCE'} />
      </div>
      <div className={'px-2'}>
        <Typography variant={'body3'} fw={'bold'} className={typographyClasses}></Typography>
      </div>
    </div>
  );
};

const DisclaimerWrapper = styled.div<{
  theme: 'dark' | 'light';
  variant: DisclaimerVariant;
}>``;
