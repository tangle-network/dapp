type DateItem = {
  month: string;
  year: number;
};

/**
 * Get the month and year for each month since the input date
 * Example return: [{ month: 'Jan', year: 2021 }, { month: 'Feb', year: 2021 }]
 */
export default function getMonthlyHistorySinceDate(
  inputDate: Date
): DateItem[] {
  const dateItems: DateItem[] = [];
  const currentDate = new Date();

  while (inputDate <= currentDate) {
    // Get the three-character short format for the month
    const month = inputDate.toString().split(' ')[1];

    dateItems.push({
      month: month,
      year: inputDate.getFullYear(),
    });

    inputDate.setMonth(inputDate.getMonth() + 1);
  }

  // Return the date items
  return dateItems;
}
