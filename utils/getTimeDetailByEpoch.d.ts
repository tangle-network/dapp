/**
 * Return time detail by epoch
 * @param {number} epoch
 * @returns {number} formatted time (Ex: 1 minute ago, 2 hours ago, 16 Dec 2023 22:21)
 */
declare const getTimeDetailByEpoch: (epoch: number) => string;
export default getTimeDetailByEpoch;
