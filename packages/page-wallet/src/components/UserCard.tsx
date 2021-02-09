import { FormatAddress } from '@webb-dapp/react-components';
import { useAccounts } from '@webb-dapp/react-hooks';
import { Card, Copy, CopyIcon, EditIcon } from '@webb-dapp/ui-components';
import React, { FC } from 'react';

import Identicon from '@polkadot/react-identicon';

import classes from './UserCard.module.scss';

export const UserCard: FC = () => {
  const { active, openSelectAccount } = useAccounts();

  return (
    <Card className={classes.root} contentClassName={classes.content} padding={false}>
      {active ? (
        <>
          <Identicon className={classes.icon} size={64} theme='polkadot' value={active.address} />
          <div className={classes.info}>
            <div className={classes.name}>{active.name || 'User'}</div>
            <FormatAddress address={active.address} className={classes.address} />
          </div>
          <div className={classes.edit} onClick={openSelectAccount}>
            <EditIcon />
            <p className={classes.action}>Change</p>
          </div>
          <Copy
            display='Copy Address Success'
            render={(): JSX.Element => (
              <div className={classes.copy}>
                <CopyIcon />
                <p className={classes.action}>Copy</p>
              </div>
            )}
            text={active.address}
            withCopy={false}
          />
        </>
      ) : null}
    </Card>
  );
};
