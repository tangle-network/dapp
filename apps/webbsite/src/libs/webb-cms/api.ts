import { WEBB_CMS_URL, WEBB_CMS_TOKEN } from './constants';
import { formatDate, formatTime } from '../../utils';
import { APIResponse, Post } from './types';

/**
 * Makes a request to the Webb CMS API
 * @param url - The base url for the api (defaults to https://webb-cms.webb.tools/api)
 * @param endpoint - The endpoint to call (defaults to '')
 * @param method - The method to use (defaults to 'GET')
 * @param headers - Any additional headers to send
 * @param body - The body to send (only used for POST, PUT and PATCH)
 * @returns The response from the api call as a Promise with the type APIResponse (success: boolean, data: any)
 *
 * @example
 * ```ts
 * const articles = await apiRequest('https://webb-cms.webb.tools/api', 'articles');
 * const article_1 = await apiRequest('https://webb-cms.webb.tools/api', 'articles/1');
 * const article_2 = await apiRequest('https://webb-cms.webb.tools/api', 'articles/2?populate=*');
 * ```
 */
export const apiRequest = async (
  url = WEBB_CMS_URL,
  endpoint = '',
  method = 'GET',
  headers = {},
  body = null
): Promise<APIResponse> => {
  try {
    const apiUrl = `${url}/${endpoint}`;

    const defaultHeaders = {
      Authorization: `Bearer ${WEBB_CMS_TOKEN}`,
      'Content-Type': 'application/json',
    };

    const requestOptions: RequestInit = {
      method,
      headers: { ...defaultHeaders, ...headers },
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      requestOptions.body = JSON.stringify(body);
    }

    const res = await fetch(apiUrl, requestOptions);

    if (!res.ok) {
      throw new Error(
        `API request to Webb CMS failed with status ${res.status}: ${res.statusText}`
      );
    }

    const response = await res.json();

    return { status: 'API request to Webb CMS was successful', data: response };
  } catch (error: any) {
    return {
      status: 'API request to Webb CMS failed',
      data: null,
      error: error.message,
    };
  }
};

export const getPosts = async (): Promise<Post[]> => {
  try {
    const response = await apiRequest(WEBB_CMS_URL, 'articles?populate=*');

    const posts: Post[] = response.data.data.map((_post: any) => {
      const post: Post = {
        id: _post.id,
        title: _post.attributes.title,
        description: _post.attributes.description,
        postType: _post.attributes.type,
        tag: _post.attributes.tag,
        linkToResearchPaper: _post.attributes.link,
        coverImage: _post.attributes.image.data[0].attributes.url,
        markdown: _post.attributes.content,
        author: {
          name: _post.attributes.author.data.attributes.name,
          twitter: _post.attributes.author.data.attributes.twitter,
        },
        dateAndTime: {
          createdDate: formatDate(_post.attributes.publishedAt),
          createdTime: formatTime(_post.attributes.publishedAt),
          lastUpdatedDate: formatDate(_post.attributes.updatedAt),
          lastUpdatedTime: formatTime(_post.attributes.updatedAt),
        },
      };

      return post;
    });

    return posts;
  } catch (error: any) {
    throw new Error('Failed to get posts from Webb CMS', error);
  }
};

export const getPostById = async (id: number): Promise<Post> => {
  try {
    const posts = await getPosts();

    const post = posts.find((_post) => _post.id === id);

    if (!post) {
      throw new Error(`Post with ID ${id} not found`);
    }

    return post;
  } catch (error: any) {
    throw new Error(`Failed to get post with ID ${id} from Webb CMS`, error);
  }
};

export const getVideos = async (): Promise<APIResponse> => {
  try {
    const response = await apiRequest(WEBB_CMS_URL, 'videos?populate=*');

    return {
      status: 'Videos retrieved successfully from Webb CMS',
      data: response.data,
    };
  } catch (error: any) {
    return {
      status: 'Failed to retrieve videos from Webb CMS',
      data: null,
      error: error.message,
    };
  }
};
