import { Metadata } from 'next';

import { APP_NAME, DEFAULT_OPENGRAPH_METADATA } from '../constants/openGraph';

export type PageMetadataOptions = {
  title: string;
  isHomepage: boolean;
  description: string;
  imageAlt: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
};

const createPageMetadata = ({
  title,
  description,
  imageUrl,
  imageAlt,
  imageWidth,
  imageHeight,
  isHomepage = false,
}: Partial<PageMetadataOptions>): Metadata => {
  const images =
    imageUrl !== undefined
      ? [
          {
            alt: imageAlt ?? 'Page preview illustration',
            url: imageUrl,
            width: imageWidth ?? 1069,
            height: imageHeight ?? 534,
          },
        ]
      : DEFAULT_OPENGRAPH_METADATA.openGraph.images;

  const titleWithAppName = title ? `${APP_NAME} | ${title}` : undefined;
  let pageTitle: string | undefined = undefined;

  // Homepage needs a special exception, since it is overriding
  // the root layout's title template.
  if (isHomepage) {
    pageTitle = titleWithAppName;
  } else {
    pageTitle = title;
  }

  return {
    ...DEFAULT_OPENGRAPH_METADATA,
    title: pageTitle ?? DEFAULT_OPENGRAPH_METADATA.title,
    description: description ?? DEFAULT_OPENGRAPH_METADATA.description,
    openGraph: {
      ...DEFAULT_OPENGRAPH_METADATA.openGraph,
      images: images,
      title: titleWithAppName ?? DEFAULT_OPENGRAPH_METADATA.openGraph.title,
      description:
        description ?? DEFAULT_OPENGRAPH_METADATA.openGraph.description,
    },
    twitter: {
      title: titleWithAppName ?? DEFAULT_OPENGRAPH_METADATA.twitter.title,
      description:
        description ?? DEFAULT_OPENGRAPH_METADATA.twitter.description,
    },
  };
};

export default createPageMetadata;
