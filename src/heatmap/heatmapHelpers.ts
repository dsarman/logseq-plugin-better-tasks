import { CompletionData, GraphData, toggleTaskRecordText } from './heatmapData';
import { getDateFromWeekAndDay } from '../utils';
import { DayType } from '../config';
import { add, getDate, startOfDay } from 'date-fns';
import { LOGBOOK } from '../common/constants';
import { getTaskReferences } from '../repeating-tasks/repeatingTasksHeatmapData';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const getYLabelsYear = (startingDay: DayType) => {
  return [...DAY_NAMES.slice(startingDay), ...DAY_NAMES.slice(0, startingDay)];
};
const DAYS = 7;

/**
 * Returns the completion data for the last 7 days.
 * @param dates A set of dates where each date represents a day that is marked in the logbook as DONE.
 */
export const getLast7DaysData = (dates: Set<Date>): CompletionData => {
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
export const getDateFromData = (
  x: number,
  y: number,
  data: GraphData,
  startDate?: Date
) => {
  return data.isExpanded
    ? getDateFromWeekAndDay(y, x, data.startingDay)
    : getDateFromWeekAndDay(x, y, data.startingDay, startDate);
};

export const getLongXLabels = (completions: CompletionData) =>
  new Array(completions[0].length).fill(0).map((_, i) => `${i + 1}`);

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

/**
 * Get the content of a block
 * @param uuid The uuid of the block
 */
export const getBlockContent = async (
  uuid: string
): Promise<string | undefined> => {
  const block = await logseq.Editor.getBlock(uuid);
  return block?.content;
};

/**
 * Checks if a given string contains a Logseq block with the Better Tasks plugin renderer and returns whether it is expanded or not.
 *
 * @param {string} text - The text to check for the Better Tasks plugin renderer.
 * @returns {boolean | null} - Returns true if the block is expanded, false if it is not expanded, and null if the block does not contain the Better Tasks plugin renderer.
 */
export const checkIfExpanded = (text: string): boolean | null => {
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

const toggleBlock = async (
  blockUuid: string,
  date: Date,
  blockContent: string
) => {
  const updatedText = toggleTaskRecordText(date, blockContent);
  await logseq.Editor.updateBlock(blockUuid, updatedText);
};

export const toggleTaskRecord = async (
  uuid: string,
  date: Date
): Promise<void> => {
  const blockContent = await getBlockContent(uuid);
  if (!blockContent) {
    console.error('Toggled block not found');
    return;
  }

  const hasLogbook = blockContent.includes(LOGBOOK);

  if (hasLogbook) {
    await toggleBlock(uuid, date, blockContent);
  } else {
    const block = await logseq.Editor.getBlock(uuid);
    if (!block) {
      console.error('Toggled block not found');
      return;
    }

    const taskReferences = await getTaskReferences(uuid);
    const referenceWithLogbook = taskReferences.find(refBlock =>
      refBlock.content.includes(LOGBOOK)
    );
    if (!referenceWithLogbook) {
      console.error(
        'Did not found any block with logbook for task block: ' + uuid
      );
      return;
    }

    const refBlockContent = await getBlockContent(referenceWithLogbook.uuid);
    if (!refBlockContent) {
      console.error(
        'Did not found any content for reference with logbook: ',
        referenceWithLogbook
      );
      return;
    }

    await toggleBlock(referenceWithLogbook.uuid, date, refBlockContent);
  }
};
