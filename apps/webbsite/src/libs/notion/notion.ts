import { Client } from '@notionhq/client';
import { NotionAPI } from 'notion-client';
import { formatDate, formatTime } from '../../utils';
import {
  NOTION_TOKEN_V2,
  NOTION_ACTIVE_USER,
  NOTION_BLOG_INTEGRATION_TOKEN,
  NOTION_BLOG_INTEGRATION_DATABASE_ID,
} from './server-constants';

export class Notion {
  private readonly notion: Client;
  private readonly notionAPI: NotionAPI;
  private readonly databaseID: string;

  constructor() {
    if (
      !NOTION_TOKEN_V2 ||
      !NOTION_ACTIVE_USER ||
      !NOTION_BLOG_INTEGRATION_TOKEN ||
      !NOTION_BLOG_INTEGRATION_DATABASE_ID
    ) {
      throw new Error(
        'Missing one or more Notion API keys, check your .env file and try again. The keys are NOTION_TOKEN_V2, NOTION_ACTIVE_USER, NOTION_BLOG_INTEGRATION_TOKEN, NOTION_BLOG_INTEGRATION_DATABASE_ID.'
      );
    }

    try {
      this.notion = new Client({
        auth: NOTION_BLOG_INTEGRATION_TOKEN,
      });

      this.databaseID = NOTION_BLOG_INTEGRATION_DATABASE_ID;

      this.notionAPI = new NotionAPI({
        authToken: NOTION_TOKEN_V2,
        activeUser: NOTION_ACTIVE_USER,
      });
    } catch (error) {
      throw new Error('Failed to initialize Notion API client');
    }
  }

  async getPosts() {
    const response = await this.notion.databases.query({
      database_id: this.databaseID,
      filter: {
        property: 'Published',
        checkbox: {
          equals: true,
        },
      },
      sorts: [
        {
          property: 'Slug',
          direction: 'ascending',
        },
      ],
    });

    const posts = await Promise.all(
      response.results.map(async (post: any) => {
        if (!post) return;

        const metadata = {
          id: post.id,
          title: post.properties.Title.title[0].plain_text,
          author: await this.notion.users
            .retrieve({
              user_id: post.properties.Author.people[0].id,
            })
            .then((user: any) => user.name),
          description: post.properties.Description.rich_text[0].plain_text,
          published: post.properties.Published.checkbox,
          slug: post.properties.Slug.formula.string,
          tags: post.properties.Tags.multi_select.map((tag: any) => tag.name),
          cover: post.cover.file.url,
          dateAndTime: {
            createdDate: formatDate(post.properties.Created.created_time),
            createdTime: formatTime(post.properties.Created.created_time),
            lastEditedDate: formatDate(
              post.properties['Last edited'].last_edited_time
            ),
            lastEditedTime: formatTime(
              post.properties['Last edited'].last_edited_time
            ),
          },
        };

        const recordMap = await this.getPostRecordMap(post.id);

        return {
          metadata,
          recordMap,
        };
      })
    );

    return posts;
  }

  async getPostBySlug(slug: string | string[]) {
    const posts = await this.getPosts();

    const post = posts.find((post) => {
      if (!post) return;

      return post.metadata.slug === slug;
    });

    if (!post) {
      throw new Error(`Post with slug ${slug} not found`);
    }

    return post;
  }

  async getPostRecordMap(id: string) {
    const recordMap = await this.notionAPI.getPage(id);

    return recordMap;
  }
}
