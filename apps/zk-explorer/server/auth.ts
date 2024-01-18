import { ApiRoute, sendApiRequest } from '../utils/api';

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
