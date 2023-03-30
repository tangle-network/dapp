import Image from 'next/image';
import Link from 'next/link';
import { ExtendedRecordMap } from 'notion-types';
import { FC } from 'react';
import { NotionRenderer } from 'react-notion-x';
import { Button, Typography } from '@webb-tools/webb-ui-components';
import { NextSeo } from 'next-seo';
import { Notion, TERMS_AND_CONDITIONS_PAGE_ID } from '../libs/notion';

const TermsAndConditions: FC<{ data: ExtendedRecordMap }> = ({ data }) => {
  return (
    <>
      <NextSeo
        title="Terms and Conditions"
        description="Terms and Conditions of Webb"
      />

      <NotionRenderer
        bodyClassName="!mt-[68px]"
        fullPage
        disableHeader
        components={{
          Header: () => <Typography variant="mkt-h2" />,
          Link: (props: any) => (
            <Button className="inline" variant="link" {...props} />
          ),
          nextImage: Image,
          nextLink: Link,
        }}
        pageCover={<div />} // Keep the content inside the <main></main>
        recordMap={data}
      />
    </>
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
