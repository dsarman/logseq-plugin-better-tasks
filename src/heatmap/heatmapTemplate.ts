import { GraphData } from './heatmapData';
import { DayType } from '../config';
import { add, isSameDay } from 'date-fns';
import { formatDate } from '../utils';
import { getDateFromData, getLast7DaysData, getShortXLabels, getYLabelsYear, longXLabels } from './heatmapHelpers';

const CELL_SIZE = '14px';
const CSS_PREFIX = 'bt-';
const GRID_ITEM_CLASS = `${CSS_PREFIX}grid-item`;
const HEATMAP_LABEL_CLASS = `${CSS_PREFIX}heatmap-label`;
const ROOT_CONTAINER_CLASS = `${CSS_PREFIX}root-container`;
const HEATMAP_CONTAINER_CLASS = `${CSS_PREFIX}heatmap-container`;
const HEATMAP_Y_AXIS_CLASS = `${CSS_PREFIX}heatmap-y-axis`;
const HEATMAP_X_AXIS_CLASS = `${CSS_PREFIX}heatmap-x-axis`;
const HEATMAP_TOGGLE_CLASS = `${CSS_PREFIX}heatmap-toggle`;
const HEATMAP_TOGGLE_SVG_CLASS = `${CSS_PREFIX}heatmap-toggle-svg`;
const GRID_CONTAINER_CLASS = `${CSS_PREFIX}grid-container`;


/**
 * Generates the CSS for the heatmap
 */
export const getHeatmapStyle = () => `
    .${ROOT_CONTAINER_CLASS} {
        display:flex;
        flex-direction:column;
        width:100%;
        left: -20px;
        position: relative;
    }
    .${HEATMAP_CONTAINER_CLASS} {
        display:flex;
        flex-direction:row;
        justify-content:initial;
    }
    .${HEATMAP_LABEL_CLASS} {
        box-sizing:border-box;
        line-height:${CELL_SIZE};
        font-size:.65rem;
        text-transform:uppercase;
        color:#777;
        white-space:nowrap
    }
    .${HEATMAP_Y_AXIS_CLASS} {
        display:flex;
        flex-direction:column;
    }
    .${HEATMAP_Y_AXIS_CLASS} .${HEATMAP_LABEL_CLASS} {
        padding:0 0.2rem;
    }
    .${HEATMAP_X_AXIS_CLASS} {
        display: grid;
    }

    .${HEATMAP_X_AXIS_CLASS} .${HEATMAP_LABEL_CLASS} {
        text-align:center;
        width: ${CELL_SIZE};
    }
    .${GRID_CONTAINER_CLASS} {
        cursor: pointer;
        display: grid;

        width: fit-content;
        height: fit-content;
    }

    .${GRID_ITEM_CLASS} {
        width: ${CELL_SIZE};
        height: ${CELL_SIZE};
        border-width: 1px 1px 0 0;
        border-color: var(--ls-primary-text-color, grey);
        border-radius: 4px;
    }

    .${GRID_ITEM_CLASS}.today-item {
        border-color: var(--ct-warning-color, pink) ;
    }

    .${GRID_ITEM_CLASS}.completed {
        background-color: var(--ct-success-color, green);
    }

    .${GRID_ITEM_CLASS}:hover {
        filter: brightness(85%);
    }

    .${HEATMAP_TOGGLE_CLASS} {
        width: 16px;
        height: 16px;
        position: relative;
    }

    .${HEATMAP_TOGGLE_SVG_CLASS} {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
`;

/**
 * Generates a cell for the heatmap
 * @param isCompleted - whether the task is completed
 * @param isToday - whether the cell represents today
 * @param title - the title for the cell
 */
const cellPartial = (isCompleted: boolean, isToday: boolean, title: string, date: Date, payloadUuid: string) => `
    <div  data-uuid='${payloadUuid}' data-date='${date.toISOString()}' data-on-click='toggleTaskRecord' class='${GRID_ITEM_CLASS} ${isCompleted ? 'completed' : ''} ${isToday ? 'today-item' : ''}' title='${title}'>
    </div>
`;

/**
 * Generates the y-axis for the heatmap
 * @param startingDay - the starting day of the week
 */
const yAxisPartial = (startingDay: DayType) => {
  const labels = getYLabelsYear(startingDay);
  return labels.map((label) => `<div class='${HEATMAP_LABEL_CLASS}'>${label}</div>`).join('\n');
};

/**
 * Generates the arrow for expanding/collapsing the heatmap
 * @param expanded - whether the heatmap is expanded
 * @param payloadUuid - the UUID for the payload
 */
const arrowPartial = (expanded: boolean | null, payloadUuid: string) => `
  <button class='${HEATMAP_TOGGLE_CLASS} rotating-arrow ${expanded ? 'not-collapsed' : 'collapsed'}' data-uuid='${payloadUuid}' data-on-click='toggleHeatmap'>
    <svg class='${HEATMAP_TOGGLE_SVG_CLASS}' aria-hidden='true' viewBox='0 0 192 512' fill='currentColor'>
      <path d='M0 384.662V127.338c0-17.818 21.543-26.741 34.142-14.142l128.662 128.662c7.81 7.81 7.81 20.474 0 28.284L34.142 398.804C21.543 411.404 0 402.48 0 384.662z' fill-rule='evenodd'>
      </path>
    </svg>
  </button>
`;

/**
 * Generates the x-axis for the heatmap
 * @param data - the data for the heatmap
 */
const xAxisPartial = (data: GraphData) => {
  const labels = data.isExpanded ? longXLabels : getShortXLabels();
  return labels.map((label, index) => `<div class='${HEATMAP_LABEL_CLASS}'>${index % 2 == 0 ? label : ''}</div>`).join('\n');
};

/**
 * Generates the grid for the heatmap
 * @param data - the data for the heatmap
 * @param payloadUuid - the UUID for the payload
 */
export const getGridTemplate = (data: GraphData, payloadUuid: string) => {
  const actualData = data.isExpanded ? data.completions : getLast7DaysData(data.dates);
  const startDate = data.isExpanded ? undefined : add(new Date(), { days: -7 });
  const cells = actualData.map((row, x) => {
    return row.map((col, y) => {
      const date = getDateFromData(x, y, data, startDate);
      const isToday = isSameDay(date, new Date());
      const title = formatDate(date);
      return cellPartial(col === 1, isToday, title, date, payloadUuid);
    }).join('\n');
  }).join('\n');

  const containerStyle = `
    grid-template-columns: repeat(${actualData[0].length}, 1fr);
    grid-template-rows: repeat(${actualData.length}, 1fr);
  `;

  const xAxisStyle = `
    grid-template-columns: repeat(${actualData[0].length}, 1fr);
    grid-template-rows: repeat(1, 1fr);
  `;

  return `
      <div class='${ROOT_CONTAINER_CLASS}'>
        <div class='${HEATMAP_CONTAINER_CLASS}'>
          ${arrowPartial(data.isExpanded, payloadUuid)}
          <div class='${HEATMAP_Y_AXIS_CLASS}'>
            ${data.isExpanded ? yAxisPartial(data.startingDay) : ''}
          </div>
          <div style='display: flex; flex-direction: column'>
            <div class='${GRID_CONTAINER_CLASS}' style='${containerStyle}' >
              ${cells}
            </div>
            <div class='${HEATMAP_X_AXIS_CLASS}' style='${xAxisStyle}'>
              ${xAxisPartial(data)}
            </div>
          </div>
        </div>
      </div>
  `;
};