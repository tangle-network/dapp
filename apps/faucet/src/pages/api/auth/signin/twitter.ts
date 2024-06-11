import { NextApiRequest, NextApiResponse } from 'next';
import { TwitterApi } from 'twitter-api-v2';

import serverConfig from '../../../../config/server';
import handleTwitterApiError from '../../../../utils/handleTwitterApiError';
import isTwitterRateLimitError from '../../../../utils/isTwitterRateLimitError';
import parseTwitterLoginBody from '../../../../utils/parseTwitterLoginBody';

async function POST(req: NextApiRequest, res: NextApiResponse) {
  return new Promise((resolve) => {
    parseTwitterLoginBody(req.body).match(
      async (body) => {
        const { clientId, code, codeVerifier, redirectUri } = body;

        try {
          const client = new TwitterApi({
            clientId: clientId,
            clientSecret: serverConfig.twitterClientSecret,
          });

          const {
            accessToken,
            refreshToken,
            expiresIn,
            client: loggedClient,
          } = await client.loginWithOAuth2({ code, codeVerifier, redirectUri });

          const twitterHandle = await getTwitterHandle(loggedClient);

          resolve(
            res.status(200).json({
              accessToken,
              expiresIn,
              refreshToken,
              twitterHandle,
            }),
          );
        } catch (error) {
          resolve(handleTwitterApiError(error, res));
        }
      },
      async (err) => {
        resolve(
          res.status(400).json({
            extraInfo: err.getPayload()?.extraInfo,
            message: err.getDisplayMessage(),
          }),
        );
      },
    );
  });
}

export default function route(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    return POST(req, res);
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}

async function getTwitterHandle(authorizedClient: TwitterApi) {
  try {
    const { data } = await authorizedClient.v2.me();
    return data.username;
  } catch (error) {
    // Return a fallback value if the error is a rate limit error
    if (isTwitterRateLimitError(error)) {
      if (error.rateLimit) {
        console.warn(
          `You just hit the rate limit! Limit for this endpoint is ${error.rateLimit.limit} requests!`,
        );
        const resetDate = new Date(error.rateLimit.reset * 1000); // Convert seconds to milliseconds
        const resetLocaleTime = resetDate.toLocaleTimeString();
        const resetLocaleDate = resetDate.toLocaleDateString();
        console.log(
          `Request counter will reset at timestamp ${resetLocaleDate} ${resetLocaleTime}.`,
        );
        console.log(
          `You have ${error.rateLimit.remaining} requests left before hitting the rate limit.`,
        );
      }
      return 'Unknown';
    }

    throw error;
  }
}
