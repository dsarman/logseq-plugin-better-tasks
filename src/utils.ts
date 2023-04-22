import { LSPluginUserEvents } from "@logseq/libs/dist/LSPlugin.user";
import React from "react";
import {addDays, addWeeks, startOfWeek} from "date-fns";

let _visible = logseq.isMainUIVisible;

function subscribeLogseqEvent<T extends LSPluginUserEvents>(
  eventName: T,
  handler: (...args: any) => void
) {
  logseq.on(eventName, handler);
  return () => {
    logseq.off(eventName, handler);
  };
}

const subscribeToUIVisible = (onChange: () => void) =>
  subscribeLogseqEvent("ui:visible:changed", ({ visible }) => {
    _visible = visible;
    onChange();
  });

export const useAppVisible = () => {
  return React.useSyncExternalStore(subscribeToUIVisible, () => _visible);
};

export const getDateFromWeekAndDay = (weekNumber: number, dayNumber: number): Date => {
    const currentYear = new Date().getFullYear();
    const januaryFirst = new Date(currentYear, 0, 1);
    const firstWeekStart = startOfWeek(januaryFirst, { weekStartsOn: 1 }); // Monday as the start of the week
    const date = addWeeks(firstWeekStart, weekNumber);
    return addDays(date, dayNumber);
}
