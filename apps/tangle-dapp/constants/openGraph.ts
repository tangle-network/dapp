import { TANGLE_DAPP_URL } from '@webb-tools/webb-ui-components/constants';

const OPENGRAPH_IMAGES_BASE_URL = '/static/opengraph';

export enum OpenGraphPageImageUrl {
  DEFAULT = `${OPENGRAPH_IMAGES_BASE_URL}/default.png`,
  Nomination = `${OPENGRAPH_IMAGES_BASE_URL}/nomination.png`,
  ClaimAirdrop = `${OPENGRAPH_IMAGES_BASE_URL}/claim-airdrop.png`,
}

export const APP_NAME = 'Tangle dApp';

export const APP_SUBTITLE = 'Kickstarting Blockchain Innovation with MPC';

export const APP_DESCRIPTION =
  'Your portal to managing Tangle Network assets and multi-party computation (MPC) services, kickstarting advanced cryptographic developments and innovations in blockchain.';

export const DEFAULT_OPENGRAPH_METADATA = {
  title: {
    default: APP_NAME,
    template: `${APP_NAME} | %s`,
  },
  description: APP_DESCRIPTION,
  metadataBase: process.env.URL
    ? new URL(process.env.URL)
    : process.env.PORT != null
    ? new URL(`http://localhost:${process.env.PORT}`)
    : null,
  openGraph: {
    title: `${APP_NAME} | ${APP_SUBTITLE}`,
    description: APP_DESCRIPTION,
    url: TANGLE_DAPP_URL,
    siteName: APP_NAME,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        alt: 'Preview illustration with page title',
        url: OpenGraphPageImageUrl.DEFAULT,
        width: 1069,
        height: 534,
      },
    ],
  },
  icons: {
    icon: '/favicon.png',
  },
  twitter: {
    title: `${APP_NAME} | ${APP_SUBTITLE}`,
    card: 'summary_large_image',
    description: APP_DESCRIPTION,
  },
};
