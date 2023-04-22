import {getISODay, getWeek, parseISO} from "date-fns";

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
        if (line.includes('"DONE"')) {
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

export const xLabels = new Array(52).fill(0).map((_, i) => `${i + 1}`)
export const yLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const transformDates = (dates: Set<Date>): Data => {
    const data: Data = new Array(yLabels.length).fill(0).map(() => new Array(xLabels.length).fill(0))
    for (const date of dates) {
        const week = getWeek(date, {weekStartsOn: 1})
        const day = getISODay(date)
        data[day - 1][week - 1] = 1
    }
    return data
}

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
        return transformDates(dates)
    }
};

