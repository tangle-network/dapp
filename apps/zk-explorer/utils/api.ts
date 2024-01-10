import assert from 'assert';
import { CircuitItem } from '../components/CircuitCard/types';
import type {
  FilterCategoryItem,
  FilterConstraints,
} from '../components/Filters/types';
import { ProjectItem } from '../components/ProjectCard/types';
import {
  MpcParticipant,
  Plan,
} from '../components/ProofGenerationStepCards/types';
import { API_PREFIX } from '../constants';
import { User } from '../hooks/useAuth';

export enum ApiRoute {
  OAuthGithub = 'oauth/github',
  SearchProjects = 'search/projects',
  SearchCircuits = 'search/circuits',
  Constraints = 'constraints',
  AuthValidate = 'auth/validate',
  AuthLogout = 'auth/logout',
  User = 'user',
  ProofGeneration = 'proof-generation',
}

export type ApiResponseWrapper<T> = {
  innerResponse: ApiResponse<T>;
  fetchResponse: Response;
};

export type ApiResponse<T = Record<string, never>> = {
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

export type FilterOptionsResponseData = {
  categories: FilterCategoryItem[];
};

export function makeAbsoluteApiEndpointUrl(route: ApiRoute): string {
  return `${API_PREFIX}/${route}`;
}

export async function sendApiRequest<T = Record<string, never>>(
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

  const finalRequestUrl = makeAbsoluteApiEndpointUrl(route);

  console.log(
    `[API] Sending ${finalOptions.method} request:`,
    finalRequestUrl,
    options?.body
  );

  const fetchResponse = await fetch(finalRequestUrl, finalOptions);

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
      method: 'GET',
      body: JSON.stringify({
        constraints,
        query,
        page,
        sortBy: sortBy ?? null,
      }),
    }
  );

  return extractResponseData(responseWrapper);
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
      method: 'GET',
      body: JSON.stringify({
        constraints,
        query,
        page,
        sortBy: sortBy ?? null,
      }),
    }
  );

  return extractResponseData(responseWrapper);
}

export async function submitProject(githubSlug: string): Promise<ApiResponse> {
  const responseWrapper = await sendApiRequest(ApiRoute.OAuthGithub, {
    method: 'POST',
    body: JSON.stringify({ githubSlug }),
  });

  return responseWrapper.innerResponse;
}

export async function fetchFilterOptions(): Promise<FilterOptionsResponseData> {
  const responseWrapper = await sendApiRequest<FilterOptionsResponseData>(
    ApiRoute.Constraints,
    {
      method: 'GET',
    }
  );

  // TODO: Temporary; Using `assert` here is incorrect, as this would not necessarily equate to a logic error.
  assert(
    responseWrapper.innerResponse.data !== undefined,
    'Response data should not be undefined'
  );

  return responseWrapper.innerResponse.data;
}

export async function updateUserProfile(
  changes: Partial<User>
): Promise<ApiResponse> {
  const responseWrapper = await sendApiRequest(ApiRoute.User, {
    method: 'PUT',
    body: JSON.stringify(changes),
  });

  return responseWrapper.innerResponse;
}

export async function requestProofGeneration(data: {
  r1cs: File;
  plan: Plan;
  verificationKey: File;
  provingKey: File;
  mpcParticipants: MpcParticipant[];
}): Promise<ApiResponse> {
  const responseWrapper = await sendApiRequest(ApiRoute.ProofGeneration, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  return responseWrapper.innerResponse;
}

export function extractResponseData<T>(
  responseWrapper: ApiResponseWrapper<T>
): T {
  // TODO: Determine whether gracefully handle errors is more appropriate here.

  assert(
    responseWrapper.innerResponse.isSuccess,
    'Response should have been successful'
  );

  assert(
    responseWrapper.innerResponse.data !== undefined,
    'Response data should not be undefined'
  );

  return responseWrapper.innerResponse.data;
}
