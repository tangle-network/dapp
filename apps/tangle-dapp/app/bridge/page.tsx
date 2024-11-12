import {
  ExchangeFunds,
  TokenSwapLineIcon,
  WalletLineIcon,
} from '@webb-tools/icons';
import { OnboardingPageKey } from '@webb-tools/tangle-shared-ui/constants';
import { TANGLE_DOCS_URL } from '@webb-tools/webb-ui-components';
import { Metadata } from 'next';
import { FC } from 'react';

import OnboardingItem from '../../components/OnboardingModal/OnboardingItem';
import OnboardingModal from '../../components/OnboardingModal/OnboardingModal';
import createPageMetadata from '../../utils/createPageMetadata';
import BridgeContainer from './BridgeContainer';

export const metadata: Metadata = createPageMetadata({
  title: 'Bridge',
});

const Bridge: FC = () => {
  return (
    <div>
      <OnboardingModal
        title="Get Started with Bridging"
        pageKey={OnboardingPageKey.BRIDGE}
        learnMoreHref={TANGLE_DOCS_URL}
      >
        <OnboardingItem
          Icon={WalletLineIcon}
          title="Connect EVM or Substrate Wallet"
          description="Connect your EVM or Substrate wallet depending on the intended source chain. For example, if bridging in assets from Ethereum, connect your MetaMask or EVM-based wallet."
        />

        <OnboardingItem
          Icon={ExchangeFunds}
          title="Bridge EVM Assets"
          description="Select source and destination chains, amount, and the recipient account's address to bridge in your EVM-based assets into Tangle to start restaking."
        />

        <OnboardingItem
          Icon={TokenSwapLineIcon}
          title="Restake Your Assets"
          description="After bridging, use the restake page to leverage your bridged assets in restaking in order to earn yield and help secure and power Blueprint services on Tangle."
        />
      </OnboardingModal>

      <BridgeContainer className="mx-auto" />
    </div>
  );
};

export default Bridge;
