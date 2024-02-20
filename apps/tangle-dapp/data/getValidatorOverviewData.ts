type ValidatorOverviewDataType = {
  identity?: string;
  isActive: boolean;
  totalRestaked: number;
  restakingMethod?: 'independent' | 'shared';
  nominations: number;
  twitter?: string;
  discord?: string;
  email?: string;
  web?: string;
  location?: string;
};

export default async function getValidatorOverviewData(
  validatorAddress: string
): Promise<ValidatorOverviewDataType> {
  // TODO: handle validatorAddress
  console.log('validatorAddress :', validatorAddress);
  return {
    identity: 'validator1',
    isActive: true,
    totalRestaked: 1000,
    restakingMethod: 'independent',
    nominations: 155,
    twitter: 'https://twitter.com/tangle_network',
    discord: 'https://discord.com/invite/krp36ZSR8J',
    email: 'someone@example.com',
    web: 'https://tangle.tools/',
    location: 'USA',
  };
}
