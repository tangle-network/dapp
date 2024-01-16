import { notificationApi } from '@webb-tools/webb-ui-components';
import assert from 'assert';
import { API_PREFIX } from '../constants';
import { gracefullyParseJson } from './index';

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
