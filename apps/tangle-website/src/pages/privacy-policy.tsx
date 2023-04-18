import Image from 'next/image';
import Link from 'next/link';
import { ExtendedRecordMap } from 'notion-types';
import { FC } from 'react';
import { NotionRenderer } from 'react-notion-x';
import { NextSeo } from 'next-seo';
import { Notion, PRIVACY_POLICY_PAGE_ID } from '../libs/notion';
import { Typography } from '@webb-tools/webb-ui-components';

const PrivacyPolicy: FC<{ data: ExtendedRecordMap }> = ({ data }) => {
  return (
    <>
      <NextSeo title="Privacy Policy" description="Privacy Policy of Webb" />

      <NotionRenderer
        bodyClassName="!mt-[68px]"
        fullPage
        disableHeader
        components={{
          Header: () => <Typography variant="mkt-h2" />,
          nextImage: Image,
          nextLink: Link,
        }}
        pageCover={<div />} // Keep the content inside the <main></main>
        recordMap={data}
      />
    </>
  );
};

export default PrivacyPolicy;

export const getStaticProps = async () => {
  const pageId = PRIVACY_POLICY_PAGE_ID;
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
