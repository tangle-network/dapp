import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { AppTemplate } from '@webb-tools/webb-ui-components/containers/AppTemplate';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';

export default function Loading() {
  return (
    <AppTemplate.Content>
      <AppTemplate.Title
        title="Claim your $TNT Airdrop"
        subTitle="CLAIM AIRDROP"
        overrideSubTitleProps={{
          className: 'text-blue-70 dark:text-blue-50',
        }}
      />

      <AppTemplate.DescriptionContainer>
        <AppTemplate.Description
          variant="mkt-body2"
          className="text-mono-140 dark:text-mono-80"
        >
          As part of {"Tangle's"} initial launch, the Tangle Network is
          distributing 5 million TNT tokens to the community. Check eligibility
          below to see if you qualify for TNT airdrop!
        </AppTemplate.Description>
      </AppTemplate.DescriptionContainer>

      <AppTemplate.Body>
        <Typography variant="mkt-body2" ta="center" fw="bold">
          Connect your EVM or Substrate wallet to check eligibility:
        </Typography>

        <div className="space-y-2">
          <Button isFullWidth isDisabled>
            Connect EVM Wallet
          </Button>

          <Button variant="secondary" isDisabled isFullWidth>
            Connect Substrate Wallet
          </Button>
        </div>
      </AppTemplate.Body>
    </AppTemplate.Content>
  );
}
