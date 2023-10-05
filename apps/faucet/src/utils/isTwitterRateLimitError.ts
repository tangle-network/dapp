import { ApiResponseError } from 'twitter-api-v2';

const isTwitterRateLimitError = (error: unknown): error is ApiResponseError => {
  return (
    error instanceof ApiResponseError &&
    !!error.rateLimitError &&
    !!error.rateLimit
  );
};

export default isTwitterRateLimitError;
