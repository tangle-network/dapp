/**
 * Return date time detail by epoch
 * @param {number} epoch
 * @returns {number} formatted time (Ex: 2023-07-28 13:16:04 (2 minutes ago))
 */
const formatDateTimeByTimestamp = (epoch: number): string => {
  const date = new Date(epoch * 1000);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const dateTimeDetail = `${year}-${day}-${month} ${hours}:${minutes}:${seconds}`;

  const now = Date.now() / 1000;
  const secondsAgo = now - epoch;

  if (secondsAgo < 60) {
    return (
      dateTimeDetail +
      ` (${Math.floor(secondsAgo)} ${
        secondsAgo === 1 ? 'second' : 'seconds'
      } ago)`
    );
  } else if (secondsAgo < 3600) {
    const minutesAgo = Math.floor(secondsAgo / 60);
    return (
      dateTimeDetail + ` (${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago)`
    );
  } else if (secondsAgo < 86400) {
    const hoursAgo = Math.floor(secondsAgo / 3600);
    return dateTimeDetail + ` (${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago)`;
  }

  return dateTimeDetail;
};

export default formatDateTimeByTimestamp;
