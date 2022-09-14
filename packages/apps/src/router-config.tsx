import { Layout } from '@webb-dapp/react-components';
import { RouterConfigData } from '@webb-dapp/react-environment';
import { PageContentLoading } from '@webb-dapp/ui-components';
import { motion } from 'framer-motion';
import React, { FC, lazy, Suspense } from 'react';

import { sideBarConfig } from './sidebar-config';

const PageMixer = lazy(() => import('@webb-dapp/page-mixer'));
const PageVBridge = lazy(() => import('@webb-dapp/vbridge'));
const PageWrapUnwrap = lazy(() => import('@webb-dapp/page-wrap-unwrap'));
const PageCrowdloan = lazy(() => import('@webb-dapp/page-crowdloan'));
const PageGovernance = lazy(() => import('@webb-dapp/page-governance'));
const PageClaims = lazy(() => import('@webb-dapp/page-claims'));
const PageNoteAccount = lazy(() => import('@webb-dapp/page-note-account'));
const PageStats = lazy(() => import('@webb-dapp/page-statistics'));

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
            <PageVBridge />
          </CSuspense>
        ),
        path: 'bridge/*',
        title: 'Bridges',
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
        element: (
          <CSuspense>
            <PageClaims />
          </CSuspense>
        ),
        path: 'claims/*',
        title: 'ECDSA Claims',
      },
      {
        element: (
          <CSuspense>
            <PageNoteAccount />
          </CSuspense>
        ),
        path: 'note-account/*',
        title: 'Note Account',
      },
      {
        element: (
          <CSuspense>
            <PageStats />
          </CSuspense>
        ),
        path: 'statistics/dkg',
        title: 'DKG stats',
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
