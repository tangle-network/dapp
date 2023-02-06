import Image from 'next/image';
import Link from 'next/link';
import { ExtendedRecordMap } from 'notion-types';
import { FC, RefAttributes } from 'react';
import { NotionRenderer } from 'react-notion-x';

import Heading2 from '../components/Heading2';
import getNotionPage from '../libs/notion/getNotionPage';
import { TERMS_AND_CONDITIONS_PAGE_ID } from '../libs/notion/server-constants';
import { Button, ButtonProps } from '@webb-tools/webb-ui-components';

const TermsAndConditions: FC<{ data: ExtendedRecordMap }> = ({ data }) => {
  return (
    <NotionRenderer
      bodyClassName="!mt-[68px]"
      fullPage
      disableHeader
      components={{
        Header: Heading2,
        Link: (props: any) => (
          <Button className="inline" variant="link" {...props} />
        ),
        nextImage: Image,
        nextLink: Link,
      }}
      pageCover={<div />} // Keep the content inside the <main></main>
      recordMap={data}
    />
  );
};

export default TermsAndConditions;

export const getStaticProps = async () => {
  const pageId = TERMS_AND_CONDITIONS_PAGE_ID;
  if (!pageId) {
    throw new Error('Missing Notion page ID.'); // Only for development
  }

  const data = await getNotionPage(pageId);

  return {
    props: {
      data,
    },

    revalidate: 60, // Revalidate every 60 seconds.
  };
};
