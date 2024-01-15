import { notificationApi } from '@webb-tools/webb-ui-components';
import assert from 'assert';
import { CircuitItem } from '../components/CircuitCard/types';
import type {
  FilterCategoryItem,
  FilterConstraints,
} from '../components/Filters/types';
import { ProjectItem } from '../components/ProjectCard/types';
import { Plan } from '../components/ProofGenerationStepCards/types';
import { API_PREFIX } from '../constants';
import { User } from '../hooks/useAuth';
import { gracefullyParseJson } from './utils';

export enum ApiRoute {
  OAuthGithub = 'oauth/github',
  SearchProjects = 'search/projects',
  SearchCircuits = 'search/circuits',
  Projects = 'projects',
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

// TODO: Consider encapsulating all of these functions into a `useApi` hook. There would obviously need to be some benefits to that approach, though. Need to investigate further.
export async function sendApiRequest<T = Record<string, never>>(
  route: ApiRoute,
  errorPrimaryMessage: string,
  options?: RequestInit
): Promise<ApiResponseWrapper<T>> {
  const headers = new Headers(options?.headers);

  // If the body is not form data, set the 'Content-Type'
  // to default to 'application/json'.
  if (!(options?.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const finalOptions: RequestInit = {
    ...options,
    headers,
  };

  const finalRequestUrl = makeAbsoluteApiEndpointUrl(route);

  console.debug(
    `[API] Sending ${
      finalOptions.method || '(method not specified?)'
    } request:`,
    finalRequestUrl,
    options?.body
  );

  const fetchResponse = await fetch(finalRequestUrl, finalOptions);
  const responseAsPlainText = await fetchResponse.text();

  const innerResponse =
    gracefullyParseJson<ApiResponse<T>>(responseAsPlainText);

  // Handle the possibility of JSON parsing failing.
  // This could be due to the response being empty, malformed,
  // or other factors such as: a network error, the backend
  // returning HTML, etc.
  if (innerResponse instanceof Error) {
    // TODO: Another great place to log the error to Sentry.
    notificationApi({
      variant: 'error',
      message: errorPrimaryMessage,
      secondaryMessage:
        'The response from the server was not valid JSON. This could mean that the server is down, or that the response was malformed. If you believe this is a bug, please submit a bug report.',
    });

    return {
      innerResponse: {
        isSuccess: false,
        errorMessage: innerResponse.message,
      },
      fetchResponse,
    };
  }

  if (!innerResponse.isSuccess) {
    // TODO: This would be a good place to log the error to a service like Sentry.
    const errorMessage =
      innerResponse.errorMessage ??
      'Hmm... No error message was provided by the backend. Please submit a bug report.';

    console.error(
      `[API] Request failed with status ${fetchResponse.status}: ${errorMessage}`
    );

    notificationApi({
      variant: 'error',
      message: errorPrimaryMessage,
      secondaryMessage: `${errorMessage} (Error code: ${fetchResponse.status})`,
    });
  }

  return {
    innerResponse,
    fetchResponse,
  };
}

export async function exchangeAuthCodeForOAuthToken(
  code: string
): Promise<boolean> {
  const responseWrapper = await sendApiRequest(
    ApiRoute.OAuthGithub,
    'GitHub auth code could not be exchanged for an OAuth token',
    {
      method: 'POST',
      body: JSON.stringify({ code }),
    }
  );

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
    'Failed to fetch projects',
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
    'Failed to fetch circuits',
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
  const responseWrapper = await sendApiRequest(
    ApiRoute.Projects,
    'Failed to submit project',
    {
      method: 'POST',
      body: JSON.stringify({ githubSlug }),
    }
  );

  return responseWrapper.innerResponse;
}

export async function fetchFilterOptions(): Promise<FilterOptionsResponseData> {
  const responseWrapper = await sendApiRequest<FilterOptionsResponseData>(
    ApiRoute.Constraints,
    'Failed to fetch filter options',
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
  const responseWrapper = await sendApiRequest(
    ApiRoute.User,
    'Failed to update user profile settings',
    {
      method: 'PUT',
      body: JSON.stringify(changes),
    }
  );

  return responseWrapper.innerResponse;
}

export async function requestProofGeneration(data: {
  r1cs: File;
  plan: Plan;
  verificationKey: File;
  provingKey: File;
  mpcParticipantAddresses: string[];
}): Promise<ApiResponse> {
  const formData = new FormData();

  // TODO: Need to centralize these keys somewhere more accessible, so that they can easily be found and updated later on.
  formData.append('r1cs', data.r1cs);
  formData.append('plan', JSON.stringify(data.plan));
  formData.append('verificationKey', data.verificationKey);
  formData.append('provingKey', data.provingKey);

  formData.append(
    'mpcParticipantAddresses',
    JSON.stringify(data.mpcParticipantAddresses)
  );

  const responseWrapper = await sendApiRequest(
    ApiRoute.ProofGeneration,
    'Failed to request proof generation',
    {
      method: 'POST',
      body: formData,
      // Do not specify the 'Content-Type' header, as it
      // will be automatically set by the browser. The browser
      // will automatically add a 'boundary' parameter to the header,
      // which is required for multipart form data.
    }
  );

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
