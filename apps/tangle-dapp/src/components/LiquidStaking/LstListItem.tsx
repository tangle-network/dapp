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
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';

type Props = {
  pool: LsPool;
  isSelfStaked: boolean;
};

const LstListItem: FC<Props> = ({ pool, isSelfStaked }) => {
  const networkTokenSymbol = useNetworkStore(
    (store) => store.network2?.tokenSymbol,
  );

  const fmtStakeAmount = formatDisplayAmount(
    pool.totalStaked,
    TANGLE_TOKEN_DECIMALS,
    AmountFormatStyle.SI,
  );

  const fmtCommission =
    pool.commissionFractional === undefined
      ? undefined
      : `${formatPercentage(pool.commissionFractional)} commission`;

  const leftBottomContent = [
    fmtStakeAmount,
    networkTokenSymbol ?? '',
    isSelfStaked ? 'self ' : 'staked',
  ]
    .filter((part) => part.trim() !== '')
    .join(' ');

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
      leftBottomContent={leftBottomContent}
      rightUpperText={`${pool.apyPercentage ?? EMPTY_VALUE_PLACEHOLDER}% APY`}
      rightBottomText={fmtCommission}
      logo={<LstIcon iconUrl={pool.iconUrl} size={LstIconSize.LG} />}
    />
  );
};

export default LstListItem;
