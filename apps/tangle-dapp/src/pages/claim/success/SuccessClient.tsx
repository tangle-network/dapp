import { ShieldedCheckLineIcon } from '@tangle-network/icons';
import { KeyValueWithButton } from '@tangle-network/ui-components/components/KeyValueWithButton';
import { AppTemplate } from '@tangle-network/ui-components/containers/AppTemplate';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { type FC } from 'react';
import { Hash } from 'viem';

const SuccessClient: FC<{ blockHash: Hash }> = ({ blockHash }) => {
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
            confirmed on the Tangle network. View transaction details on the
            explorer link below.
          </Typography>

          {blockHash && (
            <KeyValueWithButton
              label="Block Hash"
              size="sm"
              className="mx-auto"
              keyValue={blockHash}
            />
          )}
        </div>
      </AppTemplate.Body>
    </AppTemplate.Content>
  );
};

export default SuccessClient;
