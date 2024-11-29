export const trackError = (error: Error, context: string) => {
  // Implement error tracking (e.g., Sentry)
  console.error(`Error in ${context}:`, error);
};
