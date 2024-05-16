import { TaskStateStats } from '../common/types';

const PILL = 'bt-pill';
const DONE = 'bt-done';
const IN_PROGRESS = 'bt-in-progress';
const BLOCKED = 'bt-blocked';
const NOT_DONE = 'bt-not-done';
const CANCELLED = 'bt-cancelled';

export const getTaskStatsTemplate = (stats: TaskStateStats): string => {
  const total =
    stats.NOT_DONE +
    stats.IN_PROGRESS +
    stats.BLOCKED +
    stats.CANCELLED +
    stats.DONE;
  const notDoneWidth = (stats.NOT_DONE / total) * 100;
  const inProgressWidth = (stats.IN_PROGRESS / total) * 100;
  const blockedWidth = (stats.BLOCKED / total) * 100;
  const cancelledWidth = (stats.CANCELLED / total) * 100;
  const doneWidth = (stats.DONE / total) * 100;

  // Determine which types have non-zero counts
  const types = [
    { class: DONE, width: doneWidth, count: stats.DONE },
    { class: IN_PROGRESS, width: inProgressWidth, count: stats.IN_PROGRESS },
    { class: BLOCKED, width: blockedWidth, count: stats.BLOCKED },
    { class: NOT_DONE, width: notDoneWidth, count: stats.NOT_DONE },
    { class: CANCELLED, width: cancelledWidth, count: stats.CANCELLED },
  ].filter(type => type.count > 0);

  // Generate HTML for each type
  const pillsHTML = types
    .map((type, index) => {
      const isFirst = index === 0;
      const isLast = index === types.length - 1;
      const borderRadiusStyle =
        isFirst && isLast
          ? 'border-radius: 15px;'
          : isFirst
          ? 'border-top-left-radius: 15px; border-bottom-left-radius: 15px;'
          : isLast
          ? 'border-top-right-radius: 15px; border-bottom-right-radius: 15px;'
          : '';
      return `<div class='${type.class}' style='width: ${
        type.width
      }%; ${borderRadiusStyle}'>${
        type.count > 0 ? `<span>${type.count}</span>` : ''
      }</div>`;
    })
    .join('');

  return `<div class='${PILL}'>${pillsHTML}</div>`;
};

export const getTaskStatusStyle = () => `
    .${PILL} {
        width: 300px;
        height: 20px;
        display: flex;
        position: relative;
    }
    .${PILL} > div {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
    }
    .${PILL} > div > span {
        color: white;
        font-weight: bold;
        font-size: 16px;
    }
    .${PILL} .${DONE} {
        background-color: #5cb85c; /* Bootstrap success color */
    }
    .${PILL} .${IN_PROGRESS} {
        background-color: #5bc0de; /* Bootstrap info color */
    }
    .${PILL} .${BLOCKED} {
        background-color: #d9534f; /* Bootstrap danger color */
    }
    .${PILL} .${NOT_DONE} {
        background-color: #f0ad4e; /* Bootstrap warning color */
    }
    .${PILL} .${CANCELLED} {
        background-color: #d9534f; /* Bootstrap danger color */
    }
`;
