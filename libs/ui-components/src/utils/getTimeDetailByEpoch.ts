/**
 * Return time detail by epoch
 * @param {number} epoch
 * @returns {number} formatted time (Ex: 1 minute ago, 2 hours ago, 16 Dec 2023 22:21)
 */
const getTimeDetailByEpoch = (epoch: number): string => {
  const now = Date.now() / 1000;
  const secondsAgo = now - epoch;

  if (secondsAgo < 60) {
    return `${Math.floor(secondsAgo)} ${
      secondsAgo === 1 ? 'second' : 'seconds'
    } ago`;
  } else if (secondsAgo < 3600) {
    const minutesAgo = Math.floor(secondsAgo / 60);
    return `${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago`;
  } else if (secondsAgo < 86400) {
    const hoursAgo = Math.floor(secondsAgo / 3600);
    return `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
  } else {
    const date = new Date(epoch * 1000);
    const day = date.getDate().toString().padStart(2, '0');
    const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(
      date,
    );
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day} ${month} ${year} ${hours}:${minutes}`;
  }
};

export default getTimeDetailByEpoch;
