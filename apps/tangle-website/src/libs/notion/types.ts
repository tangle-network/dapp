import { ExtendedRecordMap } from 'notion-types';
import { ParsedUrlQuery } from 'querystring';

export type Author = {
  name: string;
  twitter?: string;
};

export type PostMetadata = {
  id: string;
  title: string;
  authors: Author[];
  description: string;
  published: boolean;
  slug: string;
  tags: string[];
  type: string;
  link?: string;
  cover: string;
  dateAndTime: {
    createdDate: string;
    createdTime: string;
    lastEditedDate: string;
    lastEditedTime: string;
  };
};

export type VideoMetadata = {
  id: string;
  title: string;
  link: string;
  cover: string;
  slug?: string;
  tags: string[];
  type?: string;
  published: boolean;
};

export type Post = {
  metadata: PostMetadata;
  recordMap: ExtendedRecordMap;
};

export type Video = {
  metadata: VideoMetadata;
};

export type PostsOrVideos = {
  metadata:
    | Omit<PostMetadata, 'author' | 'description' | 'published' | 'dateAndTime'>
    | VideoMetadata;
  recordMap?: ExtendedRecordMap;
};

export interface StaticPropsParams extends ParsedUrlQuery {
  id: string;
}
