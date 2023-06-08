const getClassNamesByType = (type: 'info' | 'success' | 'error') => {
  switch (type) {
    case 'info':
      return 'w-[400px]';
    case 'success':
      return 'bg-green-50 text-green-700';
    case 'error':
      return 'bg-red-50 text-red-700';
    default:
      return 'bg-blue-50 text-blue-700';
  }
};
