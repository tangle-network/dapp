import { Project } from 'next/dist/build/swc';
import { FilteringConstraints } from '../components/FilteringSidebar';
import assert from 'assert';

export enum ApiRoute {
  OAuthGithub = 'oauth/github',
}

export type ApiResponseWrapper<T extends ApiResponse = ApiEmptyResponse> = {
  innerResponse: T;
  fetchResponse: Response;
};

export type ApiResponse<T = unknown> = {
  isSuccess: boolean;
  errorMessage?: string;
  data?: T;
};

export type ApiEmptyResponse = ApiResponse<Record<string, never>>;

export type ProjectQueryResponse = ApiResponse<Project[]>;

export function makeApiRoute(route: ApiRoute): string {
  const API_PREFIX = '/api';

  return `${API_PREFIX}/${route}`;
}

export async function sendApiRequest<T extends ApiResponse = ApiEmptyResponse>(
  route: ApiRoute,
  options?: RequestInit
): Promise<ApiResponseWrapper<T>> {
  const finalOptions = {
    ...options,
    headers: {
      ...options?.headers,
      'Content-Type': 'application/json',
    },
  };

  const fetchResponse = await fetch(makeApiRoute(route), finalOptions);

  return {
    innerResponse: await fetchResponse.json(),
    fetchResponse,
  };
}

export async function exchangeAuthCodeForOAuthToken(
  code: string
): Promise<boolean> {
  const responseWrapper = await sendApiRequest(ApiRoute.OAuthGithub, {
    method: 'POST',
    body: JSON.stringify({ code }),
  });

  // No need to handle the response further, as the OAuth
  // token is set as an HTTP-only cookie by the backend.
  return responseWrapper.innerResponse.isSuccess;
}

export async function fetchProjects(
  constraints: FilteringConstraints,
  searchQuery: string,
  page: number
): Promise<Project[]> {
  const responseWrapper = await sendApiRequest<ProjectQueryResponse>(
    ApiRoute.OAuthGithub,
    {
      method: 'POST',
      body: JSON.stringify({ constraints, searchQuery, page }),
    }
  );

  // TODO: Temporary; Using `assert` here is incorrect, as this would not necessarily equate to a logic error.
  assert(
    responseWrapper.innerResponse.data !== undefined,
    "Response data shouldn't be undefined"
  );

  return responseWrapper.innerResponse.data;
}
