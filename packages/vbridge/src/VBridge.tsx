import { RequiredNoteAccount } from '@webb-dapp/react-components/PermissionedAccess/RequiredNoteAccount';
import { pageWithFeatures } from '@webb-dapp/react-components/utils/FeaturesGuard/pageWithFeatures';
import { MixerTabs } from '@webb-dapp/ui-components/Tabs/MixerTabs';
import { Deposit, Withdraw } from '@webb-dapp/vbridge/components';
import React, { FC } from 'react';
import styled from 'styled-components';

const MixerWrapper = styled.div``;
type MixerProps = {};

export const VBridge: React.FC<MixerProps> = () => {
  return (
    <MixerWrapper>
      <MixerTabs
        Withdraw={<Withdraw />}
        Deposit={
          <RequiredNoteAccount>
            <Deposit />
          </RequiredNoteAccount>
        }
      />
    </MixerWrapper>
  );
};

const PageBridge: FC = () => {
  return <VBridge />;
};

export default pageWithFeatures({
  features: ['bridge'],
  message: 'The bridge module is not supported on the current chain, please change the current network.',
})(PageBridge);
