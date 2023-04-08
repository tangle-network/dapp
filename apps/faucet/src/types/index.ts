// File contains all shared types used in the app

export type TwitterLoginResponse = {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  twitterHandle: string;
};

export type TwitterLoginBody = {
  clientId: string;
  code: string;
  codeVerifier: 'challenge';
  grantType: 'authorization_code';
  redirectUri: string;
};
