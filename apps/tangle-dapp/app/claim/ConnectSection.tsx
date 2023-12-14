'use client';

import { useConnectWallet } from '@webb-tools/api-provider-environment/ConnectWallet';
import { PresetTypedChainId } from '@webb-tools/dapp-types/ChainId';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { AppTemplate } from '@webb-tools/webb-ui-components/containers/AppTemplate';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';

function ConnectSection() {
  const { toggleModal } = useConnectWallet();

  return (
    <AppTemplate.Content>
      <AppTemplate.Title
        title="Claim your $TNT Aidrop"
        subTitle="CLAIM AIRDROP"
      />

      <AppTemplate.DescriptionContainer>
        <AppTemplate.Description
          variant="mkt-body2"
          className="text-mono-140 dark:text-mono-80"
        >
          As part of {"Tangle's"} initial launch, the Tangle Network is
          distributing 5,000,000 TNT tokens to the community. Check eligibility
          below to see if you qualify for TNT Airdrop!
        </AppTemplate.Description>
      </AppTemplate.DescriptionContainer>

      <AppTemplate.Body>
        <Typography variant="mkt-body2" ta="center" fw="bold">
          Connect your EVM or Substrate wallet to check eligibility:
        </Typography>

        <div className="space-y-2">
          <Button
            isFullWidth
            onClick={() => toggleModal(true, PresetTypedChainId.TangleTestnet)}
          >
            Connect EVM Wallet
          </Button>
          <Button
            variant="secondary"
            isFullWidth
            onClick={() =>
              toggleModal(true, PresetTypedChainId.TangleStandaloneTestnet)
            }
          >
            Connect Substrate Wallet
          </Button>
        </div>
      </AppTemplate.Body>
    </AppTemplate.Content>
  );
}

export default ConnectSection;
