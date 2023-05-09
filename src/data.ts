import { eachDayOfInterval, endOfYear, getDay, getISOWeek, parseISO, startOfYear } from "date-fns";

/**
 * Get the content of a block
 * @param uuid The uuid of the block
 */
const getBlockContent = async (uuid: string): Promise<string | undefined> => {
  const block = await logseq.Editor.getBlock(uuid);
  return block?.content;
};

const LOGBOOK = ":LOGBOOK:";
const END = ":END:";

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
  const lines = input.split("\n");
  const dateRegex = /\[(\d{4}-\d{2}-\d{2})/;
  const uniqueDates = new Set<Date>();

  for (const line of lines) {
    if (line.includes("\"DONE\"")) {
      const match = line.match(dateRegex);
      if (match) {
        const dateObject = parseISO(match[1]);
        uniqueDates.add(dateObject);
      }
    }
  }

  return uniqueDates;
};

export type Data = number[][]

export const xLabels = new Array(52).fill(0).map((_, i) => `${i}`);
export const yLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const transformDates = (dates: Set<Date>): Data => {
  const currentDate = new Date();
  const startDate = startOfYear(currentDate); // Adjusted start date
  const endDate = endOfYear(currentDate);
  const dateInterval = { start: startDate, end: endDate };
  const allDates = eachDayOfInterval(dateInterval);

  const maxWeeks = getISOWeek(endDate);
  const matrix: number[][] = Array.from({ length: 7 }, () => Array(maxWeeks).fill(0));

  const dateSet = new Set(Array.from(dates).map((date) => date.getTime()));

  allDates.forEach((date) => {
    const dayOfWeek = getDay(date) || 7; // Convert Sunday (0) to 7
    const weekOfYear = getISOWeek(date);

    const isDateInList = dateSet.has(date.getTime());

    matrix[dayOfWeek - 1][weekOfYear] = isDateInList ? 1 : 0;
  });

  return matrix;
};

/**
 * Get the logbook of a block with a given uuid
 * @param uuid The uuid of the block
 */
export const getLogbook = async (
  uuid: string
): Promise<Data | undefined> => {
  const blockContent = await getBlockContent(uuid);
  if (blockContent) {
    const logbook = getLogbookContent(blockContent);
    const dates = parseDates(logbook);
    return transformDates(dates);
  }
};

