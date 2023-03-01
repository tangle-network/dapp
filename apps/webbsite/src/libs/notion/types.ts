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
  link?: string;
};

export type VideoMetadata = {
  id: string;
  title: string;
  tags: string[];
  link: string;
  cover: string;
  slug?: string;
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
