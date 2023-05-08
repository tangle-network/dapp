import { NotionAPI } from 'notion-client';
import { ExtendedRecordMap } from 'notion-types';
import { NOTION_TOKEN_V2, NOTION_ACTIVE_USER } from './constants';

export class Notion {
  private readonly notionAPI: NotionAPI;

  constructor() {
    if (!NOTION_TOKEN_V2 || !NOTION_ACTIVE_USER) {
      throw new Error(
        'Missing one or more Notion API keys, check your .env file and try again. The keys are NOTION_TOKEN_V2, NOTION_ACTIVE_USER.'
      );
    }

    try {
      this.notionAPI = new NotionAPI({
        authToken: NOTION_TOKEN_V2,
        activeUser: NOTION_ACTIVE_USER,
      });
    } catch (error) {
      throw new Error('Failed to initialize Notion API client');
    }
  }

  async getPostRecordMap(id: string): Promise<ExtendedRecordMap> {
    try {
      const recordMap = await this.notionAPI.getPage(id);

      return recordMap;
    } catch (error) {
      throw new Error(`Failed to get post record map for id ${id}`);
    }
  }
}
