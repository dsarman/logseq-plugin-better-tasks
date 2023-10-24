import { LSPluginUserEvents } from '@logseq/libs/dist/LSPlugin.user';
import React from 'react';
import { addDays, addWeeks, format, getDay, getISOWeek } from 'date-fns';
import { DayType } from './config';

let _visible = logseq.isMainUIVisible;

/**
 * Subscribes to a Logseq event and returns a function to unsubscribe.
 * @param {string} eventName - The name of the Logseq event to subscribe to.
 * @param {function} handler - The function to be called when the event is triggered.
 * @returns {function} A function to unsubscribe from the event.
 */
function subscribeLogseqEvent<T extends LSPluginUserEvents>(
  eventName: T,
  handler: (...args: any) => void
) {
  logseq.on(eventName, handler);
  return () => {
    logseq.off(eventName, handler);
  };
}

/**
 * Subscribes to the "ui:visible:changed" Logseq event and returns a React hook to get the current visibility state of the Logseq UI.
 * @param {function} onChange - The function to be called when the visibility state changes.
 * @returns {boolean} The current visibility state of the Logseq UI.
 */
const subscribeToUIVisible = (onChange: () => void) =>
  subscribeLogseqEvent('ui:visible:changed', ({ visible }) => {
    _visible = visible;
    onChange();
  });

/**
 * A React hook to get the current visibility state of the Logseq UI.
 * @returns {boolean} The current visibility state of the Logseq UI.
 */
export const useAppVisible = () => {
  return React.useSyncExternalStore(subscribeToUIVisible, () => _visible);
};

/**
 * Returns a Date object for a given week number and day number.
 * @param {number} weekNumber - The week number (starting from 0).
 * @param {number} dayNumber - The day number (starting from 0).
 * @returns {Date} A Date object representing the specified week and day.
 */
export const getDateFromWeekAndDay = (
  weekNumber: number,
  dayNumber: number,
  startingDay: DayType,
  startDate?: Date
): Date => {
  const date = addWeeks(startDate ?? new Date(new Date().getFullYear(), 0, 1), weekNumber);
  const offset = startDate ? 0 : startingDay;
  return addDays(date, dayNumber + offset);
};

/**
 * Returns the current date as a number in the format yyyyMMdd.
 * @returns {number} The current date as a number in the format yyyyMMdd.
 */
export const getCurrentDateNumber: () => number = () => {
  const currentDate = new Date();
  const dateNumber = Number(format(currentDate, 'yyyyMMdd'));
  return dateNumber;
};

/**
 * Formats a given date as a string in the format yyyy/MM/dd.
 * @param {Date} date - The date to format.
 * @returns {string} The formatted date string.
 */
export const formatDate = (date: Date): string => {
  return format(date, 'yyyy/MM/dd');
};

/**
 * Returns the day of the week for a given date, based on a specified starting day.
 * @param {Date} date - The date to get the day of the week for.
 * @param {number} startingDay - The starting day of the week (0 for Sunday, 1 for Monday, etc.).
 * @returns {DayType} The day of the week as a DayType value.
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
 * @param {Date} date - The date to get the week number for.
 * @returns {number} The ISO week number.
 */
export const getWeekOfYear = (date: Date): number => {
  return getISOWeek(date) - 1;
};
