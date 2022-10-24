import { InfoIcon } from '@webb-dapp/ui-components/AlertCard/icons';
import { Typography } from '@webb-dapp/webb-ui-components/typography';

export const Disclaimer = () => {
  return (
    <div className={'rounded-xl p-3 border-2 border-mono-80 flex'}>
      <div className={'w-8 '}>
        <InfoIcon />
      </div>
      <div className={'px-2'}>
        <Typography variant={'body3'} fw={'bold'}>
          New spend note is added to your account to reflect updated balance on Webb.
        </Typography>
      </div>
    </div>
  );
};
