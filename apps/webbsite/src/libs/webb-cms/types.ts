export type APIResponse = {
  status: string;
  data: any;
  error?: any;
};

export type Author = {
  name: string;
  twitter?: string;
};

export type DateAndTime = {
  createdDate: string;
  createdTime: string;
  lastUpdatedDate: string;
  lastUpdatedTime: string;
};

export type Post = {
  id: number;
  title: string;
  description: string;
  postType: string;
  tag: string;
  linkToResearchPaper?: string;
  coverImage: string;
  markdown: string;
  author: Author;
  dateAndTime: DateAndTime;
};

export type Video = {
  id: number;
  title: string;
  tag: string;
  linkToVideo: string;
  coverImage: string;
};

export type PostsOrVideos = {
  id: number;
  title: string;
  tag: string;
  coverImage: string;
  linkToResearchPaper?: string;
  linkToVideo?: string;
  postType?: string;
};
