import { Metadata } from 'next';

import { DEFAULT_OPENGRAPH_METADATA } from '../constants/openGraph';

export type PageMetadataOptions = {
  title: string;
  description: string;
  imageAlt: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
};

const createPageMetadata = (
  options: Partial<PageMetadataOptions>
): Metadata => {
  const images =
    options.imageUrl !== undefined
      ? [
          {
            alt: options.imageAlt ?? 'Page preview illustration',
            url: options.imageUrl,
            width: options.imageWidth ?? 1200,
            height: options.imageHeight ?? 630,
          },
        ]
      : DEFAULT_OPENGRAPH_METADATA.openGraph.images;

  return {
    ...DEFAULT_OPENGRAPH_METADATA,
    title: options.title,
    description: options.description ?? DEFAULT_OPENGRAPH_METADATA.description,
    openGraph: {
      ...DEFAULT_OPENGRAPH_METADATA.openGraph,
      images: images,
    },
    twitter: {
      title: options.title,
    },
  };
};

export default createPageMetadata;
