import { FC, ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { twMerge } from 'tailwind-merge';

interface MetadataConfig {
  title: string;
  description: string;
  openGraph?: {
    title: string;
    description: string;
  };
}

interface PageLayoutProps {
  title: string;
  metadata: MetadataConfig;
  children: ReactNode;
  className?: string;
}

export const PageLayout: FC<PageLayoutProps> = ({
  title,
  metadata,
  children,
  className,
}) => {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />

        {/* OpenGraph tags for social sharing */}
        {metadata.openGraph && (
          <>
            <meta property="og:title" content={metadata.openGraph.title} />
            <meta
              property="og:description"
              content={metadata.openGraph.description}
            />
            <meta property="og:type" content="website" />
          </>
        )}

        {/* Additional meta tags for SEO */}
        <meta name="twitter:card" content="summary" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <main className={twMerge('container mx-auto px-4 py-6', className)}>
        {children}
      </main>
    </>
  );
};
