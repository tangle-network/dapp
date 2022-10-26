import Typography from '@mui/material/Typography';
import { SpaceBox } from '@nepoche/ui-components';
import { MixerButton } from '@nepoche/ui-components/Buttons/MixerButton';
import { ContentWrapper } from '@nepoche/ui-components/ContentWrappers';
import React from 'react';

type TermsAndConditionsProps = {
  acceptTerms: () => void;
};

export const TermsAndConditions: React.FC<TermsAndConditionsProps> = (props) => {
  return (
    <ContentWrapper>
      <Typography variant={'h1'}>Terms and Conditions</Typography>
      <div style={{ paddingTop: '20px' }}>
        <Typography>
          - I am not the person or entities who reside in, are citizens of, are incorporated in, or have a registered
          office in the United States of America or any Prohibited Localities.
        </Typography>
        <Typography style={{ paddingTop: '20px' }}>
          - I will not in the future access this site or use Webb while located within the United States any Prohibited
          Localities.
        </Typography>
        <Typography style={{ paddingTop: '20px' }}>
          - I am not using, and will not in the future use, a VPN to mask my physical location from a restricted
          territory.
        </Typography>
        <Typography style={{ paddingTop: '20px' }}>
          - I am lawfully permitted to access this site and use Webb under the laws of the jurisdiction on which I
          reside and am located.
        </Typography>
        <Typography style={{ paddingTop: '20px' }}>
          - I understand the risks associated with using Webb protocols.
        </Typography>
      </div>
      <SpaceBox height={16} />
      <MixerButton onClick={() => props.acceptTerms()} label={'Accept Terms and Conditions'} />
    </ContentWrapper>
  );
};
