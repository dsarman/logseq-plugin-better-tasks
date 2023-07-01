import { add, getDate, isSameDay } from 'date-fns';
import React from 'react';
import { HeatMapGrid } from 'react-grid-heatmap';
import {
  formatDate,
  getDateFromWeekAndDay,
  getDayOfWeek,
  getWeekOfYear,
} from '../utils';
import { CompletionData, GraphData } from './data';

interface GraphComponentProps {
  data: GraphData;
}

const baseSize = 0.9;

/**
 * An array of strings that represents the labels for the x-axis of the matrix for a year view.
 * Each element of the array is a string that represents the number of the week of the year.
 */
const xLabelsYear = new Array(52).fill(0).map((_, i) => `${i}`);

/**
 * An array of strings that represents the labels for the y-axis of the matrix for a year view.
 * Each element of the array is a string that represents the name of the day of the week.
 */
const yLabelsYear = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DAYS = 7;

/**
 * Returns an array of strings that represents the labels for the x-axis of the matrix for a week view.
 * Each element of the array is a string that represents the day of the month.
 * @returns An array of strings that represents the labels for the x-axis of the matrix for a week view.
 */
const getXLabels = () => {
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
 * Returns the completion data for the last 7 days.
 * @param completions The completion data for all days.
 * @returns The completion data for the last 7 days.
 */
const getLast7DaysData = (completions: CompletionData): CompletionData => {
  const start = add(new Date(), { days: -7 });
  const result = [];
  for (let i = 0; i <= DAYS; i++) {
    const date = add(start, { days: i });
    const week = getWeekOfYear(date);
    const dayOfWeek = getDayOfWeek(date);
    result.push(completions[dayOfWeek][week]);
  }

  return [result];
};

/**
 * The component that renders the heatmap.
 * @param data The data to render the heatmap with.
 * @returns The heatmap component.
 */
export const GraphComponent = ({ data }: GraphComponentProps) => {
  const startDate = data.isExpanded ? undefined : add(new Date(), { days: -7 });

  return (
    <div
      style={{
        width: '100%',
        fontFamily: 'sans-serif',
      }}
    >
      <HeatMapGrid
        data={
          data.isExpanded
            ? data.completions
            : getLast7DaysData(data.completions)
        }
        xLabels={data.isExpanded ? xLabelsYear : getXLabels()}
        yLabels={data.isExpanded ? yLabelsYear : ['']}
        // Reder cell with tooltip
        cellRender={(x, y, value) => {
          const date = data.isExpanded
            ? getDateFromWeekAndDay(y, x)
            : getDateFromWeekAndDay(x, y, startDate);
          const style = { width: '100%', height: '100%' };
          return <div title={formatDate(date)} style={style} />;
        }}
        xLabelsStyle={index => ({
          color: index % 2 ? 'transparent' : '#777',
          fontSize: '.65rem',
          whiteSpace: 'nowrap',
        })}
        yLabelsStyle={() => ({
          fontSize: '.65rem',
          textTransform: 'uppercase',
          color: '#777',
          whiteSpace: 'nowrap',
        })}
        cellStyle={(x, y, ratio) => {
          const date = data.isExpanded
            ? getDateFromWeekAndDay(y, x)
            : getDateFromWeekAndDay(x, y, startDate);
          const isToday = isSameDay(date, new Date());

          return {
            background: `rgb(12, 160, 44, ${ratio})`,
            fontSize: '.7rem',
            color: `rgb(0, 0, 0, ${ratio / 2 + 0.4})`,
            borderColor: isToday ? '#FB0E7D' : 'white',
          };
        }}
        cellHeight={`${baseSize}rem`}
        xLabelsPos="bottom"
        onClick={(x, y) => alert(`Clicked (${x}, ${y})`)}
        square
      />
    </div>
  );
};
