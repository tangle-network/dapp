import { useDashboard } from '@webb-dapp/react-hooks';
import { Statistic } from '@webb-dapp/ui-components';
import { FormatFixed18 } from '@webb-dapp/react-components';
import { TinyAreaChart } from 'bizcharts';
import React, { FC } from 'react';
import classes from './DashboardDetail.module.scss';

interface StatisticContentProps {
  value?: string;
  history?: {
    date: number;
    value: number;
  }[];
  color: string;
}

const StatisticContent: FC<StatisticContentProps> = ({ color, history, value }) => {
  return (
    <div className={classes.statisticContent}>
      <div>{value ? <FormatFixed18 data={value} /> : '--'}</div>
      <div>
        <TinyAreaChart color={color} data={history || []} height={60} width={124} xField='date' yField='value' />
      </div>
    </div>
  );
};

const DashboardDetail: FC = () => {
  const data = useDashboard();

  return (
    <div className={classes.root}>
      <div className={classes.item}>
        <Statistic
          className={classes.statistic}
          title='aUSD Issued'
          value={<StatisticContent color='#ff7788' history={data.aUSDIssued.history} value={data.aUSDIssued.value} />}
        />
      </div>
      <div className={classes.item}>
        <Statistic
          className={classes.statistic}
          title='Dex Daily Volume'
          value={
            <StatisticContent color='#c39fdf' history={data.dexDailyVolume.history} value={data.dexDailyVolume.value} />
          }
        />
      </div>
      <div className={classes.item}>
        <Statistic
          className={classes.statistic}
          title='DOT Staked'
          value={<StatisticContent color='#4be1b5' history={data.DOTStaked.history} value={data.DOTStaked.value} />}
        />
      </div>
      <div className={classes.item}>
        <Statistic
          className={classes.statistic}
          title='New Accounts'
          value={<StatisticContent color='#ff7788' history={data.newAccounts.history} value={data.newAccounts.value} />}
        />
      </div>
      <div className={classes.item}>
        <Statistic
          className={classes.statistic}
          title='Daily Trascation'
          value={
            <StatisticContent
              color='#c39fdf'
              history={data.dailyTrascation.history}
              value={data.dailyTrascation.value}
            />
          }
        />
      </div>
      <div className={classes.item}>
        <Statistic
          className={classes.statistic}
          title='Total Asset Locked'
          value={
            <StatisticContent
              color='#4be1b5'
              history={data.totalAssetLocked.history}
              value={data.totalAssetLocked.value}
            />
          }
        />
      </div>
    </div>
  );
};

export default DashboardDetail;
