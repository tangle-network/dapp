export enum ApiRoute {
  OAuthGithub = 'oauth/github',
}

export type ApiResponseWrapper<T extends ApiResponse = ApiEmptyResponse> = {
  data: T;
  fetchResponse: Response;
};

export type ApiResponse<T = unknown> = {
  isSuccess: boolean;
  errorMessage?: string;
  data?: T;
};

export type ApiEmptyResponse = ApiResponse<Record<string, never>>;

export function getApiRoute(route: ApiRoute): string {
  const API_PREFIX = '/api';

  return `${API_PREFIX}/${route}`;
}

export async function makeApiRequest<T extends ApiResponse = ApiEmptyResponse>(
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

  const response = await fetch(getApiRoute(route), finalOptions);

  return {
    data: await response.json(),
    fetchResponse: response,
  };
}

export async function exchangeAuthCodeForOAuthToken(
  code: string
): Promise<boolean> {
  const response = await makeApiRequest(ApiRoute.OAuthGithub, {
    method: 'POST',
    body: JSON.stringify({ code }),
  });

  // No need to handle the response further, as the OAuth
  // token is set as an HTTP-only cookie by the backend.
  return response.data.isSuccess;
}
