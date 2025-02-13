import { TANGLE_CLOUD_URL } from '@tangle-network/webb-ui-components/constants';
import type { Metadata } from 'next';

export const APP_NAME = 'Tangle Cloud';

export const APP_SUBTITLE = 'Deploy and Scale Your Services Effortlessly';

export const APP_DESCRIPTION =
  'Streamline deployment, generate revenue, and innovate with Tangle Cloud. Deploy effortlessly.';

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
      : new URL(TANGLE_CLOUD_URL), // Fallback to the default URL
  openGraph: {
    title: `${APP_NAME} | ${APP_SUBTITLE}`,
    description: APP_DESCRIPTION,
    url: TANGLE_CLOUD_URL,
    siteName: APP_NAME,
    locale: 'en_US',
    type: 'website',
    // TODO: Add opengraph images
    images: [],
  },
  icons: {
    icon: '/favicon.ico',
  },
  twitter: {
    title: `${APP_NAME} | ${APP_SUBTITLE}`,
    card: 'summary_large_image',
    description: APP_DESCRIPTION,
  },
} as const satisfies Metadata;
