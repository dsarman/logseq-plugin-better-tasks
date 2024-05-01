import { parseISO } from 'date-fns';

import { DATE_REGEX, END, LOGBOOK, NEWLINE } from './constants';

/**
 * Parses the content of a block and returns the logbook
 * @param content The content of the block
 */
export const getLogbookContent = (content: string): string => {
  const start = content.indexOf(LOGBOOK) + LOGBOOK.length;
  const end = content.indexOf(END);
  return content.substring(start, end - 1);
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
export const parseDates = (input: string): Set<Date> => {
  const lines = input.split(NEWLINE);
  const uniqueDates = new Set<Date>();

  for (const line of lines) {
    if (line.includes('State "DONE" from')) {
      const match = line.match(DATE_REGEX);
      if (match) {
        const dateObject = parseISO(match[1]);
        uniqueDates.add(dateObject);
      }
    }
  }

  return uniqueDates;
};
