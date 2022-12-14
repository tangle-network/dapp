export type BlockRanges = {
  start: number;
  end: number;
}[];

/**
 * Function: getBlockRanges(totalNumberOfMonths, lastProcessBlock, blockTime)
 *
 * Purpose: To get the block ranges(starting block number of the month, ending block number of the month)
 *          over a period of requested months i.e totalNumberOfMonths
 *
 * Steps involved to get the block ranges:
 * 1. Get the date when the first block was produced (Ex: November 26 2022)
 *
 * 1. Loop through the total number of months requested for and get the date of the first day
 *    of the month and the date of the last day of the month in that iteration.
 *    Ex: If totalNumberOfMonths = 3 and current date = December 14 2022
 *    Get the following dates:
 *    Iteration 1: [Oct 1 2022, Oct 31 2022] - Block Range 1
 *    Iteration 2: [Nov 1 2022, Nov 30 2022] - Block Range 2
 *    Iteration 3: [Dec 1 2022, Dec 14 2022] - Block Range 3
 *
 * 2. In each iteration check if the first or last day of the month is before or after the date on which the
 *    first block was produced.
 *    If before - meaning the chain has not started yet and it would be optimal to set the block number of
 *                that date in that month as 0.
 *                Ex:
 *                Oct 1 2022 < Nov 26 2022 so first block number = 0
 *                Oct 31 2022 < Nov 26 2022 so last block number = 0
 *                Which results in block range of that month being [0, 0] which in return will not yield any results
 *                since the chain has not started in october.
 *    If after - consider the date as it is.
 *
 * 3. In each iteration, after finalizing the right first date and last date of that month, calculate the total
 *    number of seconds from the first date to present time and total number of seconds from last date to present
 *    time.
 *
 * 4. Now, using the seconds of the first date to present time and the last date to present time, calculate
 *    the block number around first date's timestamp and the block number around last date's timestamp using
 *    the below formula:
 *
 *    blockNumber(date) = lastProcessBlockNumber - (n / blockTime)
 *
 *    Where n = number of seconds of from the date to present time
 *
 *    Ex: blockNumber(firstDayOfTheMonth) = lastProcessedBlockNumber -
 *        (numberOfSecondsFromFirstDayOfTheMonthToPresentTime / blockTime)
 */

/**
 * Returns an array of block ranges(starting block number of the month, ending block number of the month)
 * over a period of totalNumberOfMonths
 * @param totalNumberOfMonths Total number of months to get the block ranges of
 * @param lastProcessBlock Latest processed block number
 * @param blockTime Time taken to generate a new block in seconds. Default value is 12 seconds but an accurate
 * value should be passed to get accurate block ranges
 * @returns
 */
export const getBlockRanges = (
  totalNumberOfMonths: number,
  lastProcessBlock: string,
  blockTime = 12
): BlockRanges => {
  const timeRanges: BlockRanges = [];

  const now = new Date();

  for (let i = totalNumberOfMonths; i >= 1; i--) {
    let startBlockNumber, endBlockNumber;

    const firstBlockTimestamp = new Date(
      new Date().setDate(
        now.getDate() -
          Math.floor((Number(lastProcessBlock) * blockTime) / (24 * 60 * 60))
      )
    );

    const firstDayOfMonthTimestamp = new Date(
      now.getFullYear(),
      now.getMonth() - (i - 1),
      1
    );

    const lastDayOfMonthTimestamp = new Date(
      now.getFullYear(),
      now.getMonth() - (i - 1),
      new Date(now.getFullYear(), now.getMonth() - (i - 2), 0).getDate()
    );

    if (firstDayOfMonthTimestamp < firstBlockTimestamp) {
      startBlockNumber = 0;
    } else {
      const secondsFromFirstDayOfMonthToNow = Math.floor(
        Math.abs(firstDayOfMonthTimestamp.getTime() - now.getTime()) / 1000
      );

      startBlockNumber = Math.abs(
        Math.floor(
          Number(lastProcessBlock) - secondsFromFirstDayOfMonthToNow / blockTime
        )
      );
    }

    if (lastDayOfMonthTimestamp < firstBlockTimestamp) {
      endBlockNumber = 0;
    } else {
      let secondsFromLastDayOfMonthToNow;

      if (i === 1) {
        secondsFromLastDayOfMonthToNow =
          lastDayOfMonthTimestamp.getDate() <= now.getDate()
            ? Math.floor(
                Math.abs(lastDayOfMonthTimestamp.getTime() - now.getTime()) /
                  1000
              )
            : Math.floor(Math.abs(now.getSeconds() / 1000));
      } else {
        secondsFromLastDayOfMonthToNow = Math.floor(
          Math.abs(lastDayOfMonthTimestamp.getTime() - now.getTime()) / 1000
        );
      }

      endBlockNumber = Math.abs(
        Math.floor(
          Number(lastProcessBlock) - secondsFromLastDayOfMonthToNow / blockTime
        )
      );
    }

    timeRanges.push({
      start: startBlockNumber,
      end: endBlockNumber,
    });
  }

  return timeRanges;
};
