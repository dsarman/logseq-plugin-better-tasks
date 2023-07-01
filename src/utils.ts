import { LSPluginUserEvents } from '@logseq/libs/dist/LSPlugin.user';
import React from 'react';
import {
  addDays,
  addWeeks,
  format,
  getDay,
  getISOWeek,
  startOfWeek,
} from 'date-fns';

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
  startDate?: Date
): Date => {
  let firstWeekStart = startDate;
  if (!firstWeekStart) {
    const currentYear = new Date().getFullYear();
    const januaryFirst = new Date(currentYear, 0, 1);
    firstWeekStart = startOfWeek(januaryFirst, { weekStartsOn: 1 }); // Monday as the start of the week
  }
  const date = addWeeks(firstWeekStart, weekNumber);
  return addDays(date, dayNumber);
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

export const formatDate = (date: Date): string => {
  return format(date, 'yyyy/MM/dd');
};

export const getDayOfWeek = (date: Date): number => {
  return (getDay(date) || 7) - 1;
};

export const getWeekOfYear = (date: Date): number => {
  return getISOWeek(date);
};
