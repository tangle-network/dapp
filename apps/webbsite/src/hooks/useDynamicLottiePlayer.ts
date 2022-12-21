import { useEffect } from 'react';

/**
 * Dynamically import the lottie player component
 * use with the `<dotlottie-player></dotlottie-player>` tag
 */
const useDynamicLottiePlayer = (): void => {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    import('@dotlottie/player-component');
  }, []);
};

export default useDynamicLottiePlayer;
