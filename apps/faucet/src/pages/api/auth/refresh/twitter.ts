import { NextApiRequest, NextApiResponse } from 'next';
import {
  ApiPartialResponseError,
  ApiRequestError,
  ApiResponseError,
  TwitterApi,
} from 'twitter-api-v2';

import parseTwitterRefreshTokensBody from '../../../..//utils/parseTwitterRefreshTokensBody';
import serverConfig from '../../../../config/server';

async function POST(req: NextApiRequest, res: NextApiResponse) {
  // Process a POST request
  try {
    const { clientId, refreshToken } = parseTwitterRefreshTokensBody(req.body);

    const client = new TwitterApi({
      clientId,
      clientSecret: serverConfig.twitterClientSecret,
    });

    const {
      client: refreshedClient,
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn,
    } = await client.refreshOAuth2Token(refreshToken);
    const { data: userObject } = await refreshedClient.v2.me();

    res.status(200).json({
      accessToken,
      expiresIn,
      refreshToken: newRefreshToken,
      twitterHandle: userObject.username,
    });
  } catch (error) {
    // Handle twitter api errors
    if (error instanceof ApiResponseError) {
      return res.status(error.code).json(error.toJSON());
    }

    if (error instanceof ApiRequestError) {
      return res.status(502).json(error.toJSON());
    }

    if (error instanceof ApiPartialResponseError) {
      return res.status(502).json(error.toJSON());
    }

    // Fall back to a generic error
    const message = error instanceof Error ? error.message : 'Bad Request';
    res.status(400).json({ message });
  }
}

export default function route(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    return POST(req, res);
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
