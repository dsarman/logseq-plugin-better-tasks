import { CompletionData, GraphData } from './heatmapData';
import { getDateFromWeekAndDay, getDayOfWeek, getWeekOfYear } from '../utils';
import { DayType } from '../config';
import { add, getDate } from 'date-fns';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const getYLabelsYear = (startingDay: DayType) => {
  return [...DAY_NAMES.slice(startingDay), ...DAY_NAMES.slice(0, startingDay)];
};
const DAYS = 7;
/**
 * Returns the completion data for the last 7 days.
 * @param completions The completion data for all days.
 * @param startingDay The starting day of the week. 1 for Monday, 0 for Sunday. 1 by default.
 * @returns The completion data for the last 7 days.
 */
export const getLast7DaysData = (
  completions: CompletionData,
  startingDay = 1
): CompletionData => {
  const start = add(new Date(), { days: -7 });
  const result = [];
  for (let i = 0; i <= DAYS; i++) {
    const date = add(start, { days: i });
    const week = getWeekOfYear(date);
    const dayOfWeek = getDayOfWeek(date, startingDay);
    result.push(completions[dayOfWeek][week]);
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