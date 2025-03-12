import { FC } from 'react';
import LstIcon from './LstIcon';
import {
  AmountFormatStyle,
  EMPTY_VALUE_PLACEHOLDER,
  formatDisplayAmount,
  Typography,
} from '@tangle-network/ui-components';
import { LsPool } from '../../constants/liquidStaking/types';
import { LstIconSize } from './types';
import formatPercentage from '@tangle-network/ui-components/utils/formatPercentage';
import LogoListItem from '../Lists/LogoListItem';
import { TANGLE_TOKEN_DECIMALS } from '@tangle-network/dapp-config';

type Props = {
  pool: LsPool;
  isSelfStaked: boolean;
};

const LstListItem: FC<Props> = ({ pool, isSelfStaked }) => {
  const fmtStakeAmount = formatDisplayAmount(
    pool.totalStaked,
    TANGLE_TOKEN_DECIMALS,
    AmountFormatStyle.SI,
  );

  const fmtCommission =
    pool.commissionFractional === undefined
      ? undefined
      : `${formatPercentage(pool.commissionFractional)} commission`;

  const stakeText = `${fmtStakeAmount} ${lsProtocol.token}`;

  return (
    <LogoListItem
      leftUpperContent={
        <Typography
          variant="body1"
          fw="bold"
          className="block text-mono-200 dark:text-mono-0"
        >
          {pool.name?.toUpperCase()}{' '}
          <span className="text-mono-180 dark:text-mono-120">#{pool.id}</span>
        </Typography>
      }
      leftBottomContent={`${stakeText} ${isSelfStaked ? 'self ' : ''}staked`}
      rightUpperText={`${pool.apyPercentage ?? EMPTY_VALUE_PLACEHOLDER}% APY`}
      rightBottomText={fmtCommission}
      logo={<LstIcon iconUrl={pool.iconUrl} size={LstIconSize.LG} />}
    />
  );
};

export default LstListItem;
