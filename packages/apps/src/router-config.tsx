import { Layout } from '@webb-dapp/react-components';
import { RouterConfigData } from '@webb-dapp/react-environment';
import { PageContentLoading } from '@webb-dapp/ui-components';
import { motion } from 'framer-motion';
import React, { FC, lazy, Suspense } from 'react';

import { sideBarConfig } from './sidebar-config';

const PageMixer = lazy(() => import('@webb-dapp/page-mixer'));
const PageBridge = lazy(() => import('@webb-dapp/page-bridge'));
const PageVBridge = lazy(() => import('@webb-dapp/vbridge'));
const PageWrapUnwrap = lazy(() => import('@webb-dapp/page-wrap-unwrap'));
const PageCrowdloan = lazy(() => import('@webb-dapp/page-crowdloan'));
const PageStatistics = lazy(() => import('@webb-dapp/page-statistics'));
const PageGovernance = lazy(() => import('@webb-dapp/page-governance'));

const animations = {
  initial: { x: -230, opacity: 0.5 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -230 },
};

const CSuspense: FC = ({ children }) => {
  return <Suspense fallback={<PageContentLoading />}>{children}</Suspense>;
};

export const config: RouterConfigData[] = [
  {
    children: [
      {
        element: (
          <CSuspense>
            <PageMixer />
          </CSuspense>
        ),
        path: 'mixer/*',
        title: 'Mixers',
      },
      {
        element: (
          <CSuspense>
            <PageBridge />
          </CSuspense>
        ),
        path: 'bridge/*',
        title: 'Bridges',
      },
      {
        element: (
          <CSuspense>
            <PageVBridge />
          </CSuspense>
        ),
        path: 'vbridge/*',
        title: 'VariableBridges',
      },
      {
        element: (
          <CSuspense>
            <PageWrapUnwrap />
          </CSuspense>
        ),
        path: 'wrap-unwrap/*',
        title: 'Wrap/Unwrap',
      },
      {
        element: (
          <CSuspense>
            <PageCrowdloan />
          </CSuspense>
        ),
        path: 'crowdloan/*',
        title: 'Crowdloan',
      },
      {
        element: (
          <CSuspense>
            <PageStatistics view={'overview'} />
          </CSuspense>
        ),
        path: 'statistics/overview/*',
        title: 'Statistics Overview',
      },
      {
        element: (
          <CSuspense>
            <PageStatistics view={'deposits'} />
          </CSuspense>
        ),
        path: 'statistics/deposits/*',
        title: 'Deposit Statistics',
      },
      {
        element: (
          <CSuspense>
            <PageStatistics view={'withdrawals'} />
          </CSuspense>
        ),
        path: 'statistics/withdrawals/*',
        title: 'Withdrawal Statistics',
      },
      {
        element: (
          <CSuspense>
            <PageStatistics view={'relayers'} />
          </CSuspense>
        ),
        path: 'statistics/relayers/*',
        title: 'Relayer Statistics',
      },
      {
        element: (
          <CSuspense>
            <PageStatistics view={'dkg'} />
          </CSuspense>
        ),
        path: 'statistics/dkg/*',
        title: 'DKG Statistics',
      },
      {
        element: (
          <CSuspense>
            <PageStatistics view={'overview'} />
          </CSuspense>
        ),
        path: 'statistics/*',
        title: 'Statistics Overview',
      },
      {
        element: (
          <CSuspense>
            <motion.div
              variants={animations}
              initial='initial'
              animate='animate'
              exit='exit'
              transition={{ duration: 1 }}
            >
              <PageGovernance view='proposal-detail' />
            </motion.div>
          </CSuspense>
        ),
        path: 'governance/substrate-democracy/proposals/:voteId',
        title: 'Substrate Democracy',
      },
      {
        element: (
          <CSuspense>
            <PageGovernance view='substrate-democracy' />
          </CSuspense>
        ),
        path: 'governance/substrate-democracy/*',
        title: 'Substrate Democracy',
      },
      {
        path: '*',
        redirectTo: 'mixer',
      },
    ],
    element: <Layout.Main sidebar={sideBarConfig} />,
    path: '*',
  },
].filter((elt) => elt.path !== 'null');
