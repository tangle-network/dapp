import { FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { NextSeo } from 'next-seo';
import { ExtendedRecordMap } from 'notion-types';
import { NotionRenderer } from 'react-notion-x';
import { Button, Typography } from '@webb-tools/webb-ui-components';
import links from '@webb-tools/dapp-config/links';
import { Notion, TERMS_AND_CONDITIONS_PAGE_ID } from '../libs/notion';

const { TANGLE_MARKETING_URL, WEBB_MARKETING_URL } = links;

const TermsAndConditions: FC<{ data: ExtendedRecordMap }> = ({ data }) => {
  return (
    <div className="bg-body bg-repeat-y bg-top">
      <NextSeo
        title="Terms and Conditions"
        description="Terms and Conditions of Webb"
      />

      <NotionRenderer
        className="!bg-inherit"
        bodyClassName="!mt-[68px]"
        fullPage
        disableHeader
        components={{
          Header: () => <Typography variant="mkt-h2" />,
          Link: ({ children, ...restProps }) => {
            const textContent = children.props.children;
            return typeof textContent === 'string' &&
              textContent.includes(WEBB_MARKETING_URL) ? ( // Replace the link to Webbsite with Tangle website
              <Button
                className="inline"
                variant="link"
                {...restProps}
                href={TANGLE_MARKETING_URL}
              >
                {textContent.replace(WEBB_MARKETING_URL, TANGLE_MARKETING_URL)}
              </Button>
            ) : (
              <Button className="inline" variant="link" {...restProps}>
                {children}
              </Button>
            );
          },
          nextImage: Image,
          nextLink: Link,
        }}
        pageCover={<div />} // Keep the content inside the <main></main>
        recordMap={data}
      />
    </div>
  );
};

export default TermsAndConditions;

export const getStaticProps = async () => {
  const pageId = TERMS_AND_CONDITIONS_PAGE_ID;
  if (!pageId) {
    throw new Error('Missing Notion page ID.'); // Only for development
  }

  const notion = new Notion();

  const data = await notion.getPostRecordMap(pageId);

  return {
    props: {
      data,
    },

    revalidate: 60, // Revalidate every 60 seconds.
  };
};
