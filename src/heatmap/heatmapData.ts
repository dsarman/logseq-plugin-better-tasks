import { eachDayOfInterval, endOfISOWeekYear, format, isSameDay, parseISO, startOfISOWeekYear } from 'date-fns';
import { DATE_REGEX, NEWLINE } from '../common/constants';
import { DayType } from '../config';
import { getDoneDatesForTask } from '../repeating-tasks/repeatingTasksHeatmapData';
import { getDayOfWeek, getWeekOfYear } from '../utils';
import { getLogbookContent } from '../common/logbook';
import { checkIfExpanded, getBlockContent } from './heatmapHelpers';

/**
 * Formats a given date as a string in the format that is used in the logbook.
 * @param date - The date to format.
 */
const formatDateForLogbook = (date: Date): string => {
  return format(date, 'yyyy-MM-dd EEE HH:mm');
};

/**
 * Toggles a date in a given task's logbook.
 * @param date The date to toggle.
 * @param wholeBlock The whole task block content.
 */
export const toggleTaskRecordText = (
  date: Date,
  wholeBlock: string
): string => {
  const logbook = getLogbookContent(wholeBlock);

  const lines = logbook.split(NEWLINE);
  const doneLineIndex = lines.findIndex(line => {
    const lineDateMatch = line.match(DATE_REGEX);
    if (lineDateMatch) {
      const lineDate = parseISO(lineDateMatch[1]);
      return isSameDay(date, lineDate);
    }
    return false;
  });

  if (doneLineIndex > -1) {
    lines.splice(doneLineIndex, 1);
  } else {
    const newLine = `* State "DONE" from "LATER" [${formatDateForLogbook(
      date
    )}]`;
    lines.push(newLine);
  }

  const newLogbook = lines.join(NEWLINE);
  return wholeBlock.replace(logbook, newLogbook);
};

/**
 * Represents a matrix of numbers that represents the days of the week and weeks of the year.
 * Each cell of the matrix is either 0 or 1, where 0 means that the date is not in the logbook and 1 means that it is.
 */
export type CompletionData = number[][];

/**
 * Represents the data for a completion graph.
 * @property isExpanded A boolean that represents whether the graph is expanded or not.
 * @property completions A matrix of numbers that represents the days of the week and weeks of the year.
 */
export type GraphData = {
  uuid: string;
  isExpanded: boolean | null;
  dates: Set<Date>;
  completions: CompletionData;
  startingDay: DayType;
};

/**
 * Transforms a set of dates into a matrix of numbers that represents the days of the week and weeks of the year.
 * Each cell of the matrix is either 0 or 1, where 0 means that the date is not in the logbook and 1 means that it is.
 *
 * @param dates A set of dates to transform into a matrix.
 * @param startingDay The starting day of the week (0 for Sunday, 1 for Monday, etc.).
 * @returns A matrix of numbers that represents the days of the week and weeks of the year.
 */
const transformDates = (
  dates: Set<Date>,
  startingDay: number
): CompletionData => {
  const currentDate = new Date();
  const startDate = startOfISOWeekYear(currentDate); // Adjusted start date
  const endDate = endOfISOWeekYear(currentDate);
  const dateInterval = { start: startDate, end: endDate };
  const allDates = eachDayOfInterval(dateInterval);

  const maxWeeks = getWeekOfYear(endDate);
  const matrix: number[][] = Array.from({ length: 7 }, () =>
    Array(maxWeeks).fill(0)
  );

  const dateSet = new Set(Array.from(dates).map(date => date.getTime()));

  allDates.forEach(async date => {
    const dayOfWeek = getDayOfWeek(date, startingDay);
    const weekOfYear = getWeekOfYear(date);

    const isDateInList = dateSet.has(date.getTime());
    matrix[dayOfWeek][weekOfYear] = isDateInList ? 1 : 0;
  });

  return matrix;
};

/**
 * Gets the logbook of a block with a given uuid.
 * The logbook is transformed into a matrix of numbers that represents the days of the week and weeks of the year.
 * Each cell of the matrix is either 0 or 1, where 0 means that the date is not in the logbook and 1 means that it is.
 *
 * @param uuid The uuid of the block.
 * @param startingDay The starting day of the week (0 for Sunday, 1 for Monday, etc.).
 * @returns A matrix of numbers that represents the days of the week and weeks of the year.
 */
export const getGraphData = async (
  uuid: string,
  startingDay: DayType
): Promise<GraphData | undefined> => {
  const blockContent = await getBlockContent(uuid);
  if (blockContent) {
    const dates = await getDoneDatesForTask(uuid);

    return {
      uuid,
      isExpanded: checkIfExpanded(blockContent),
      dates,
      completions: transformDates(dates, startingDay),
      startingDay,
    };
  }
};
