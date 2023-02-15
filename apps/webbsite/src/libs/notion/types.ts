import { ExtendedRecordMap } from 'notion-types';
import { ParsedUrlQuery } from 'querystring';

export type PostMetadata = {
  id: string;
  title: string;
  author: string;
  description: string;
  published: boolean;
  slug: string;
  tags: string[];
  cover: string;
  dateAndTime: {
    createdDate: string;
    createdTime: string;
    lastEditedDate: string;
    lastEditedTime: string;
  };
};

export type Post = {
  metadata: PostMetadata;
  recordMap: ExtendedRecordMap;
};

export interface StaticPropsParams extends ParsedUrlQuery {
  id: string;
}
