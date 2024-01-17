import assert from 'assert';
import { FilterCategoryItem } from '../containers/Filters/types';
import { ApiRoute, sendApiRequest } from '../utils/api';

export type FilterOptionsResponseData = {
  categories: FilterCategoryItem[];
};

export async function fetchFilterOptions(): Promise<FilterOptionsResponseData> {
  const responseWrapper = await sendApiRequest<FilterOptionsResponseData>(
    ApiRoute.Constraints,
    'Failed to fetch filter options',
    {
      method: 'GET',
    }
  );

  // TODO: Temporary; Using `assert` here is incorrect, as this would not necessarily equate to a logic error.
  assert(
    responseWrapper.innerResponse.data !== undefined,
    'Response data should not be undefined'
  );

  return responseWrapper.innerResponse.data;
}
