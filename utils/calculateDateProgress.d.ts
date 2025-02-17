import { ISubQlTime } from '../types';
/**
 * Calculated the percentage of the current date have passed since the start date
 * @param startDateStr The start date string
 * @param endDateStr The end date string
 * @returns `null` when one of the provided string is invalid or the start date is in the future,
 * otherwise returns the percentage of the current date have passed since the start date
 */
export declare const calculateDateProgress: (startDateStr: string | Date | null, endDateStr: string | Date | null, now?: ISubQlTime) => number | null;
