import { NextApiResponse } from 'next';
import {
  ApiPartialResponseError,
  ApiRequestError,
  ApiResponseError,
} from 'twitter-api-v2';

const handleTwitterApiError = (error: unknown, res: NextApiResponse) => {
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
};

export default handleTwitterApiError;
