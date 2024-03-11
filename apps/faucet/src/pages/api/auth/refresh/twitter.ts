import { NextApiRequest, NextApiResponse } from 'next';
import { TwitterApi } from 'twitter-api-v2';

import serverConfig from '../../../../config/server';
import handleTwitterApiError from '../../../../utils/handleTwitterApiError';
import parseTwitterRefreshTokensBody from '../../../../utils/parseTwitterRefreshTokensBody';

async function POST(req: NextApiRequest, res: NextApiResponse) {
  return new Promise((resolve) => {
    parseTwitterRefreshTokensBody(req.body).match(
      async (body) => {
        const { clientId, refreshToken } = body;

        try {
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

          resolve(
            res.status(200).json({
              accessToken,
              expiresIn,
              refreshToken: newRefreshToken,
              twitterHandle: userObject.username,
            })
          );
        } catch (error) {
          resolve(handleTwitterApiError(error, res));
        }
      },
      async (err) => {
        resolve(
          res.status(400).json({
            extraInfo: err.getPayload()?.extraInfo,
            message: err.message,
          })
        );
      }
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
