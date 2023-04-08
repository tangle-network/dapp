import { NextApiRequest, NextApiResponse } from 'next';
import { TwitterApi } from 'twitter-api-v2';

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
