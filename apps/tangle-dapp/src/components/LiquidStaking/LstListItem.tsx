import { FC } from 'react';
import LstIcon from './LstIcon';
import {
  AmountFormatStyle,
  EMPTY_VALUE_PLACEHOLDER,
  formatDisplayAmount,
  Typography,
} from '@webb-tools/webb-ui-components';
import { LsPool } from '../../constants/liquidStaking/types';
import { LstIconSize } from './types';
import formatFractional from '@webb-tools/webb-ui-components/utils/formatFractional';
import getLsProtocolDef from '../../utils/liquidStaking/getLsProtocolDef';

type Props = { pool: LsPool; isSelfStaked: boolean };

const LstListItem: FC<Props> = ({ pool, isSelfStaked }) => {
  const commissionText =
    pool.commissionFractional === undefined
      ? undefined
      : `${formatFractional(pool.commissionFractional)} commission`;

  const lsProtocol = getLsProtocolDef(pool.protocolId);

  const stakeAmountString = formatDisplayAmount(
    pool.totalStaked,
    lsProtocol.decimals,
    AmountFormatStyle.SI,
  );

  const stakeText = `${stakeAmountString} ${lsProtocol.token}`;

  return (
    <>
      <div className="flex items-center gap-3">
        <LstIcon
          lsProtocolId={pool.protocolId}
          iconUrl={pool.iconUrl}
          size={LstIconSize.LG}
        />

        <div className="flex flex-col">
          <Typography
            variant="body1"
            fw="bold"
            className="block text-mono-200 dark:text-mono-0"
          >
            {pool.name?.toUpperCase()}
            <span className="text-mono-180 dark:text-mono-120">#{pool.id}</span>
          </Typography>

          <Typography
            variant="body1"
            className="block text-mono-140 dark:text-mono-120"
          >
            {stakeText} {isSelfStaked && 'self '}staked
          </Typography>
        </div>
      </div>

      <div className="flex flex-col items-end justify-center">
        <Typography variant="body1">
          {pool.apyPercentage ?? EMPTY_VALUE_PLACEHOLDER}% APY
        </Typography>

        {commissionText !== undefined && (
          <Typography
            variant="body1"
            className="block text-mono-140 dark:text-mono-120"
          >
            {commissionText}
          </Typography>
        )}
      </div>
    </>
  );
};

export default LstListItem;
