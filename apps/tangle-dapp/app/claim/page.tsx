import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { Divider } from '@webb-tools/webb-ui-components/components/Divider';
import { AppTemplate } from '@webb-tools/webb-ui-components/containers/AppTemplate';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';

export default async function ClaimPage() {
  return (
    <AppTemplate.Root>
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
            distributing 5,000,000 TNT tokens to the community. Check
            eligibility below to see if you qualify for TNT Airdrop!
          </AppTemplate.Description>
        </AppTemplate.DescriptionContainer>

        <AppTemplate.Body>
          <Typography variant="mkt-body2" ta="center" fw="bold">
            Connect your EVM or Substrate wallet to check eligibility:
          </Typography>

          <Button isFullWidth>Connect Wallet</Button>
        </AppTemplate.Body>
      </AppTemplate.Content>

      <Divider className="my-16 bg-mono-180 dark:bg-mono-120" />

      <AppTemplate.Content>
        <h1>FAQ</h1>
      </AppTemplate.Content>
    </AppTemplate.Root>
  );
}
