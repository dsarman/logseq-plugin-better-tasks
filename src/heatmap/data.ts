import { eachDayOfInterval, endOfYear, parseISO, startOfYear } from 'date-fns';
import { getDayOfWeek, getWeekOfYear } from '../utils';
import { DayType } from '../config';

/**
 * Get the content of a block
 * @param uuid The uuid of the block
 */
const getBlockContent = async (uuid: string): Promise<string | undefined> => {
  const block = await logseq.Editor.getBlock(uuid);
  return block?.content;
};

const LOGBOOK = ':LOGBOOK:';
const END = ':END:';

/**
 * Parses the content of a block and returns the logbook
 * @param content The content of the block
 */
const getLogbookContent = (content: string): string => {
  const start = content.indexOf(LOGBOOK) + LOGBOOK.length;
  const end = content.indexOf(END);
  const logbook = content.substring(start, end);
  return logbook;
};

/**
 * Parses a multiline input string and returns a Set of unique Date objects for lines ending with the "DONE" state.
 *
 * @param {string} input - A multiline string with dates in the format [YYYY-MM-DD].
 * Example:
 * ```
 * * State "DONE" from "LATER" [2023-04-21 Fri 19:20]
 * * State "DONE" from "LATER" [2023-04-22 Sat 14:30]
 * * State "LATER" from "TODO" [2023-04-22 Sat 16:10]
 * * State "DONE" from "LATER" [2023-04-21 Fri 19:20]
 * ```
 */
const parseDates = (input: string): Set<Date> => {
  const lines = input.split('\n');
  const dateRegex = /\[(\d{4}-\d{2}-\d{2})/;
  const uniqueDates = new Set<Date>();

  for (const line of lines) {
    if (line.includes('State "DONE" from')) {
      const match = line.match(dateRegex);
      if (match) {
        const dateObject = parseISO(match[1]);
        uniqueDates.add(dateObject);
      }
    }
  }

  return uniqueDates;
};

/**
 * Represents a matrix of numbers that represents the days of the week and weeks of the year.
 * Each cell of the matrix is either 0 or 1, where 0 means that the date is not in the logbook and 1 means that it is.
 */
export type CompletionData = number[][];

/**
 * Represents the data for a completion graph.
 * @property expanded A boolean that represents whether the graph is expanded or not.
 * @property completions A matrix of numbers that represents the days of the week and weeks of the year.
 */
export type GraphData = {
  uuid: string;
  isExpanded: boolean | null;
  completions: CompletionData;
  startingDay: DayType;
};

/**
 * Transforms a set of dates into a matrix of numbers that represents the days of the week and weeks of the year.
 * Each cell of the matrix is either 0 or 1, where 0 means that the date is not in the logbook and 1 means that it is.
 *
 * @param dates A set of dates to transform into a matrix.
 * @returns A matrix of numbers that represents the days of the week and weeks of the year.
 */
const transformDates = (dates: Set<Date>, startingDay: number): CompletionData => {
  const currentDate = new Date();
  const startDate = startOfYear(currentDate); // Adjusted start date
  const endDate = endOfYear(currentDate);
  const dateInterval = { start: startDate, end: endDate };
  const allDates = eachDayOfInterval(dateInterval);

  const maxWeeks = getWeekOfYear(endDate);
  const matrix: number[][] = Array.from({ length: 7 }, () =>
    Array(maxWeeks).fill(0)
  );

  const dateSet = new Set(Array.from(dates).map(date => date.getTime()));

  allDates.forEach(async (date) => {
    const dayOfWeek = getDayOfWeek(date, startingDay);
    const weekOfYear = getWeekOfYear(date);

    const isDateInList = dateSet.has(date.getTime());
    console.log(date, dayOfWeek, weekOfYear, isDateInList)
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
 * @returns A matrix of numbers that represents the days of the week and weeks of the year.
 */
export const getGraphData = async (
  uuid: string,
  startingDay: DayType
): Promise<GraphData | undefined> => {
  const blockContent = await getBlockContent(uuid);
  if (blockContent) {
    const logbook = getLogbookContent(blockContent);
    const dates = parseDates(logbook);
    return {
      uuid,
      isExpanded: checkIfExpanded(blockContent),
      completions: transformDates(dates, startingDay),
      startingDay
    };
  }
};

/**
 * Checks if a given string contains a Logseq block with the Better Tasks plugin renderer and returns whether it is expanded or not.
 *
 * @param {string} text - The text to check for the Better Tasks plugin renderer.
 * @returns {boolean | null} - Returns true if the block is expanded, false if it is not expanded, and null if the block does not contain the Better Tasks plugin renderer.
 */
const checkIfExpanded = (text: string): boolean | null => {
  if (text.includes('{{renderer better-tasks expanded}}')) {
    return true;
  } else if (text.includes('{{renderer better-tasks}}')) {
    return false;
  } else {
    return null;
  }
};

/**
 * Toggles the expanded state of a Logseq block with the Better Tasks plugin renderer.
 *
 * @param {string} text - The text of the Logseq block.
 * @returns {string} - The updated text with the expanded state toggled.
 */
const toggleExpandedText = (text: string): string => {
  if (text.includes('{{renderer better-tasks expanded}}')) {
    return text.replace(
      /{{renderer better-tasks expanded}}/g,
      '{{renderer better-tasks}}'
    );
  } else if (text.includes('{{renderer better-tasks}}')) {
    return text.replace(
      /{{renderer better-tasks}}/g,
      '{{renderer better-tasks expanded}}'
    );
  } else {
    return text;
  }
};

/**
 * Toggles the expanded state of a Logseq block with the Better Tasks plugin renderer.
 *
 * @param {string} uuid - The uuid of the Logseq block.
 * @returns {Promise<void>} - A Promise that resolves when the block has been updated.
 */
export const toggleExpanded = async (uuid: string): Promise<void> => {
  const blockContent = await getBlockContent(uuid);
  if (blockContent) {
    const updatedText = toggleExpandedText(blockContent);
    await logseq.Editor.updateBlock(uuid, updatedText);
  }
};
