export type BlockRanges = {
  start: number;
  end: number;
}[];

// Default blockTime is 12 secs but should be passed as an arg
export const getBlockRanges = (
  totalNumberOfMonths: number,
  lastProcessBlock: string,
  blockTime = 12
): BlockRanges => {
  const timeRanges: BlockRanges = [];

  const now = new Date();

  for (let i = 12; i >= 1; i--) {
    if (i !== totalNumberOfMonths) {
      timeRanges.push({
        start: 0,
        end: 0,
      });
    } else {
      for (let i = totalNumberOfMonths; i >= 1; i--) {
        let startBlockNumber, endBlockNumber;

        const firstBlockTimestamp = new Date(
          new Date().setDate(
            now.getDate() -
              Math.floor(
                (Number(lastProcessBlock) * blockTime) / (24 * 60 * 60)
              )
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
              Number(lastProcessBlock) -
                secondsFromFirstDayOfMonthToNow / blockTime
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
                    Math.abs(
                      lastDayOfMonthTimestamp.getTime() - now.getTime()
                    ) / 1000
                  )
                : Math.floor(Math.abs(now.getSeconds() / 1000));
          } else {
            secondsFromLastDayOfMonthToNow = Math.floor(
              Math.abs(lastDayOfMonthTimestamp.getTime() - now.getTime()) / 1000
            );
          }

          endBlockNumber = Math.abs(
            Math.floor(
              Number(lastProcessBlock) -
                secondsFromLastDayOfMonthToNow / blockTime
            )
          );
        }

        timeRanges.push({
          start: startBlockNumber,
          end: endBlockNumber,
        });
      }

      break;
    }
  }

  return timeRanges;
};
