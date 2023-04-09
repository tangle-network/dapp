import { NextApiRequest, NextApiResponse } from 'next';
import { TwitterApi } from 'twitter-api-v2';

import serverConfig from '../../../../config/server';
import handleTwitterApiError from '../../../../utils/handleTwitterApiError';
import parseTwitterLoginBody from '../../../../utils/parseTwitterLoginBody';

async function POST(req: NextApiRequest, res: NextApiResponse) {
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

        const { data: userObject } = await loggedClient.v2.me();

        res.status(200).json({
          accessToken,
          expiresIn,
          refreshToken,
          twitterHandle: userObject.username,
        });
      } catch (error) {
        handleTwitterApiError(error, res);
      }
    },
    async (err) => {
      res.status(400).json({
        extraInfo: err.getPayload()?.extraInfo,
        message: err.getDisplayMessage(),
      });
    }
  );
}

export default function route(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    return POST(req, res);
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
