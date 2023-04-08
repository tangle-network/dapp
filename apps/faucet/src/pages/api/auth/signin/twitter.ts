import { NextApiRequest, NextApiResponse } from 'next';
import {
  ApiPartialResponseError,
  ApiRequestError,
  ApiResponseError,
  TwitterApi,
} from 'twitter-api-v2';

import serverConfig from '../../../../config/server';
import parseTwitterLoginBody from '../../../../utils/parseTwitterLoginBody';

async function POST(req: NextApiRequest, res: NextApiResponse) {
  // Process a POST request
  try {
    const { code, clientId, codeVerifier, redirectUri } = parseTwitterLoginBody(
      req.body
    );

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

    const { data: userObject } = await loggedClient.v2.me();

    res.status(200).json({
      accessToken,
      expiresIn,
      refreshToken,
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
