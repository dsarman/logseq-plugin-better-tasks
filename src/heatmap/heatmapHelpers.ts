import { CompletionData, GraphData } from './heatmapData';
import { getDateFromWeekAndDay } from '../utils';
import { DayType } from '../config';
import { add, getDate, startOfDay } from 'date-fns';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const getYLabelsYear = (startingDay: DayType) => {
  return [...DAY_NAMES.slice(startingDay), ...DAY_NAMES.slice(0, startingDay)];
};
const DAYS = 7;

/**
 * Returns the completion data for the last 7 days.
 * @param dates A set of dates where each date represents a day that is marked in the logbook as DONE.
 */
export const getLast7DaysData = (
  dates: Set<Date>
): CompletionData => {
  const start = startOfDay(add(new Date(), { days: -7 }));
  const timeDates = new Set(Array.from(dates).map(date => date.getTime()));
  const result = [];
  for (let i = 0; i <= DAYS; i++) {
    const date = add(start, { days: i });
    if (timeDates.has(date.getTime())) {
      result.push(1);
    } else {
      result.push(0);
    }
  }

  return [result];
};

/**
 * Returns a Date object for a given week number and day number.
 * @param x The x coordinate of the cell.
 * @param y The y coordinate of the cell.
 * @param data The graph data.
 * @param startDate The start date of the graph.
 */
export const getDateFromData = (x: number, y: number, data: GraphData, startDate?: Date) => {
  return data.isExpanded
    ? getDateFromWeekAndDay(y, x, data.startingDay)
    : getDateFromWeekAndDay(x, y, data.startingDay, startDate);
};

/**
 * An array of strings that represents the labels for the x-axis of the matrix for a year view.
 * Each element of the array is a string that represents the number of the week of the year.
 */
export const longXLabels = new Array(52).fill(0).map((_, i) => `${i + 1}`);

/**
 * Returns an array of strings that represents the labels for the x-axis of the matrix for a week view.
 * Each element of the array is a string that represents the day of the month.
 * @returns An array of strings that represents the labels for the x-axis of the matrix for a week view.
 */
export const getShortXLabels = () => {
  const start = add(new Date(), { days: -7 });
  const result = [];
  for (let i = 0; i <= DAYS; i++) {
    const date = add(start, { days: i });
    const dayOfMonth = getDate(date);
    result.push(`${dayOfMonth}`);
  }
  return result;
};