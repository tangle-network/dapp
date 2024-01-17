import { Plan } from '../components/StepCards/types';
import { ApiResponse, ApiRoute, sendApiRequest } from '../utils/api';

export async function requestProofGeneration(data: {
  r1cs: File;
  plan: Plan;
  verificationKey: File;
  provingKey: File;
  mpcParticipantAddresses: string[];
}): Promise<ApiResponse> {
  const formData = new FormData();

  // TODO: Need to centralize these keys somewhere more accessible, so that they can easily be found and updated later on.
  formData.append('r1cs', data.r1cs);
  formData.append('plan', JSON.stringify(data.plan));
  formData.append('verificationKey', data.verificationKey);
  formData.append('provingKey', data.provingKey);

  formData.append(
    'mpcParticipantAddresses',
    JSON.stringify(data.mpcParticipantAddresses)
  );

  const responseWrapper = await sendApiRequest(
    ApiRoute.ProofGeneration,
    'Failed to request proof generation',
    {
      method: 'POST',
      body: formData,
      // Do not specify the 'Content-Type' header, as it
      // will be automatically set by the browser. The browser
      // will automatically add a 'boundary' parameter to the header,
      // which is required for multipart form data.
    }
  );

  return responseWrapper.innerResponse;
}
