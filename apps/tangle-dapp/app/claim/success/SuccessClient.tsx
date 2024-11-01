'use client';

import type { HexString } from '@polkadot/util/types';
import { ExternalLinkLine, ShieldedCheckLineIcon } from '@webb-tools/icons';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { KeyValueWithButton } from '@webb-tools/webb-ui-components/components/KeyValueWithButton';
import { AppTemplate } from '@webb-tools/webb-ui-components/containers/AppTemplate';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { type FC } from 'react';

import useSubstrateExplorerUrl from '../../../hooks/useSubstrateExplorerUrl';

const SuccessClient: FC<{ blockHash: HexString }> = ({ blockHash }) => {
  const { getExplorerUrl } = useSubstrateExplorerUrl();

  const txExplorerUrl = getExplorerUrl(blockHash, 'block');

  return (
    <AppTemplate.Content>
      <AppTemplate.Title
        title="You have successfully claimed $TNT airdrop!"
        subTitle="CONGRATULATIONS!"
        overrideSubTitleProps={{
          className: 'text-blue-70 dark:text-blue-50',
        }}
      />

      <AppTemplate.Body>
        <div className="flex flex-col gap-4 p-9">
          <ShieldedCheckLineIcon
            width={54}
            height={54}
            className="mx-auto fill-green-70 dark:fill-green-30"
          />

          <Typography variant="body1" ta="center">
            You have successfully claimed TNT airdrop! Your transaction has been
            confirmed on the Tangle Network. You can view your transaction on
            the explorer below.
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
          ) : blockHash ? (
            <KeyValueWithButton
              label="Transaction Hash"
              size="sm"
              className="mx-auto"
              keyValue={blockHash}
            />
          ) : null}
        </div>
      </AppTemplate.Body>
    </AppTemplate.Content>
  );
};

export default SuccessClient;
