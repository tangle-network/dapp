import { ExternalLinkLine, ShieldedCheckLineIcon } from '@webb-tools/icons';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { KeyValueWithButton } from '@webb-tools/webb-ui-components/components/KeyValueWithButton';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import React from 'react';

type Props = {
  txExplorerUrl: URL | null;
  successBlockHash: string;
};

const SucessClaim = ({ successBlockHash, txExplorerUrl }: Props) => {
  return (
    <div className="flex flex-col gap-4 p-9">
      <ShieldedCheckLineIcon
        width={54}
        height={54}
        className="mx-auto fill-green-70 dark:fill-green-30"
      />

      <Typography variant="body1" ta="center">
        You have successfully claimed $TNT Airdrop! Your transaction has been
        confirmed on the Tangle Network. You can view your transaction on the
        explorer below.
      </Typography>

      {txExplorerUrl ? (
        <Button
          target="_blank"
          href={txExplorerUrl.toString()}
          size="sm"
          variant="link"
          className="mx-auto"
          rightIcon={<ExternalLinkLine className="!fill-current" />}
        >
          Open Explorer
        </Button>
      ) : successBlockHash ? (
        <KeyValueWithButton
          label="Transaction Hash"
          size="sm"
          className="mx-auto"
          keyValue={successBlockHash}
        />
      ) : null}
    </div>
  );
};

export default SucessClaim;
