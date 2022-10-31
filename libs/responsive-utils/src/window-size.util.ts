export const WindowSize = () => {
  if (typeof window !== void 0 + '') {
    return {
      height: window.innerHeight,
      width: window.innerWidth,
    };
  } else {
    return {
      height: 600,
      width: 1200,
    };
  }
};
