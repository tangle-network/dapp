import getNotionClient from './getNotionClient';

export default function getNotionPage(pageId: string) {
  const notion = getNotionClient();
  return notion.getPage(pageId);
}
