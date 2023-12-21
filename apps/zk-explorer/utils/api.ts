import { CircuitItem } from '../components/CircuitCard/types';
import { ProjectItem } from '../components/ProjectCard/types';
import type { FilterConstraints } from '../components/SidebarFilters/types';
import assert from 'assert';

export enum ApiRoute {
  OAuthGithub = 'oauth/github',
  SearchProjects = 'search/projects',
  SearchCircuits = 'search/circuits',
}

export type ApiResponseWrapper<T extends ApiResponse> = {
  innerResponse: T;
  fetchResponse: Response;
};

export type ApiResponse<T = unknown> = {
  isSuccess: boolean;
  errorMessage?: string;
  data?: T;
};

export type ProjectSearchResponseData = {
  projects: ProjectItem[];
  resultCount: number;
};

export type CircuitSearchResponseData = {
  circuits: CircuitItem[];
  resultCount: number;
};

export function makeApiRoute(route: ApiRoute): string {
  const API_PREFIX = '/api';

  return `${API_PREFIX}/${route}`;
}

export async function sendApiRequest<T = Record<string, never>>(
  route: ApiRoute,
  options?: RequestInit
): Promise<ApiResponseWrapper<ApiResponse<T>>> {
  const finalOptions = {
    ...options,
    headers: {
      ...options?.headers,
      'Content-Type': 'application/json',
    },
  };

  const finalRoute = makeApiRoute(route);

  console.log('Sending API request to route:', finalRoute, options?.body);

  const fetchResponse = await fetch(finalRoute, finalOptions);

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

export enum SearchSortByClause {
  MostPopular = 'Most Popular',
  Newest = 'Newest',
}

export async function searchProjects(
  constraints: FilterConstraints,
  query: string,
  page: number,
  sortBy?: SearchSortByClause
): Promise<ProjectSearchResponseData> {
  const responseWrapper = await sendApiRequest<ProjectSearchResponseData>(
    ApiRoute.SearchProjects,
    {
      method: 'POST',
      body: JSON.stringify({
        constraints,
        query,
        page,
        sortBy: sortBy ?? null,
      }),
    }
  );

  // TODO: Temporary; Using `assert` here is incorrect, as this would not necessarily equate to a logic error.
  assert(
    responseWrapper.innerResponse.data !== undefined,
    "Response data shouldn't be undefined"
  );

  return responseWrapper.innerResponse.data;
}

export async function searchCircuits(
  constraints: FilterConstraints,
  query: string,
  page: number,
  sortBy?: SearchSortByClause
): Promise<CircuitSearchResponseData> {
  const responseWrapper = await sendApiRequest<CircuitSearchResponseData>(
    ApiRoute.SearchCircuits,
    {
      method: 'POST',
      body: JSON.stringify({
        constraints,
        query,
        page,
        sortBy: sortBy ?? null,
      }),
    }
  );

  // TODO: Temporary; Using `assert` here is incorrect, as this would not necessarily equate to a logic error.
  assert(
    responseWrapper.innerResponse.data !== undefined,
    "Response data shouldn't be undefined"
  );

  return responseWrapper.innerResponse.data;
}

export async function submitProject(githubSlug: string): Promise<ApiResponse> {
  const responseWrapper = await sendApiRequest(ApiRoute.OAuthGithub, {
    method: 'POST',
    body: JSON.stringify({ githubSlug }),
  });

  return responseWrapper.innerResponse;
}
