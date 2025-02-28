import { createIcon } from './create-icon';
import { IconBase } from './types';

export const PlayFillIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    d: 'M12.9173 8.2772L5.85156 12.9877C5.69839 13.0899 5.49143 13.0485 5.38931 12.8953C5.35281 12.8405 5.33333 12.7762 5.33333 12.7104V3.28939C5.33333 3.10529 5.48257 2.95605 5.66666 2.95605C5.73247 2.95605 5.79681 2.97553 5.85156 3.01204L12.9173 7.72253C13.0705 7.82467 13.1119 8.0316 13.0097 8.1848C12.9853 8.2214 12.9539 8.2528 12.9173 8.2772Z',
    displayName: 'PlayFillIcon',
  });
};
