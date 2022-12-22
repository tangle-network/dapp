import { useEffect } from 'react';

/**
 * Dynamically import the lottie player component
 * use with the `<lottie-player></lottie-player>` tag
 */
const useDynamicLottiePlayer = (): void => {
  useEffect(() => {
    import('@lottiefiles/lottie-player');
  }, []);
};

export default useDynamicLottiePlayer;
