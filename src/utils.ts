import { addDays, addWeeks, format, getDay, getISOWeek } from 'date-fns';
import { DayType } from './config';

/**
 * Calculates the date based on the given week number, day number, starting day, and optional start date.
 *
 * @param weekNumber - The week number.
 * @param dayNumber - The day number.
 * @param startingDay - The starting day of the week.
 * @param [startDate] - The optional start date. If not provided, defaults to the first day of the current year.
 * @returns - The calculated date.
 */
export const getDateFromWeekAndDay = (
  weekNumber: number,
  dayNumber: number,
  startingDay: DayType,
  startDate?: Date
): Date => {
  const date = addWeeks(startDate ?? new Date(new Date().getFullYear(), 0, 1), weekNumber);
  const offset = startDate ? 0 : startingDay - 1;
  return addDays(date, dayNumber + offset);
};

/**
 * Formats a given date as a string in the format yyyy/MM/dd.
 * @param date - The date to format.
 * @returns The formatted date string.
 */
export const formatDate = (date: Date): string => {
  return format(date, 'yyyy/MM/dd');
};

/**
 * Returns the day of the week for a given date, based on a specified starting day.
 * @param date - The date to get the day of the week for.
 * @param startingDay - The starting day of the week (0 for Sunday, 1 for Monday, etc.).
 * @returns The day of the week as a DayType value.
 */
export const getDayOfWeek = (date: Date, startingDay: number): DayType => {
  const day = getDay(date);
  const difference = day - startingDay;
  let result: DayType;
  if (difference < 0) {
    result = (difference + 7) as DayType;
  } else {
    result = difference as DayType;
  }
  return result;
};

/**
 * Returns the ISO week number for a given date.
 * @param date - The date to get the week number for.
 * @returns The ISO week number.
 */
export const getWeekOfYear = (date: Date): number => {
  return getISOWeek(date) - 1;
};