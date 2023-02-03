import { NotionAPI } from 'notion-client';

let notionClient: NotionAPI;

/**
 * Lazy load the notion client
 * @returns the notion client
 */
export default function getNotionClient(): NotionAPI {
  if (notionClient) {
    return notionClient;
  }

  const NOTION_TOKEN_V2 = process.env.NOTION_TOKEN_V2;
  const NOTION_ACTIVE_USER = process.env.NOTION_ACTIVE_USER;
  if (!NOTION_TOKEN_V2 || !NOTION_ACTIVE_USER) {
    throw new Error('Missing neither NOTION_TOKEN_V2 nor NOTION_ACTIVE_USER');
  }

  notionClient = new NotionAPI({
    authToken: NOTION_TOKEN_V2,
    activeUser: NOTION_ACTIVE_USER,
  });

  return notionClient;
}
