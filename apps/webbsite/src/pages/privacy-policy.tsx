import { FC } from 'react';
import { ExtendedRecordMap } from 'notion-types';

import getNotionPage from '../libs/notion/getNotionPage';
import { PRIVACY_AND_POLICY_PAGE_ID } from '../libs/notion/server-constants';

const PrivacyPolicy: FC<{ data: ExtendedRecordMap }> = ({ data }) => {
  console.log(data);
  return <div>PrivacyPolicy</div>;
};

export default PrivacyPolicy;

export const getStaticProps = async () => {
  const pageId = PRIVACY_AND_POLICY_PAGE_ID;
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
