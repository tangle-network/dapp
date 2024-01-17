import { User } from '../hooks/useAuth';
import { ApiResponse, ApiRoute, sendApiRequest } from '../utils/api';

export async function updateUserProfile(
  changes: Partial<User>
): Promise<ApiResponse> {
  const responseWrapper = await sendApiRequest(
    ApiRoute.User,
    'Failed to update user profile settings',
    {
      method: 'PUT',
      body: JSON.stringify(changes),
    }
  );

  return responseWrapper.innerResponse;
}
