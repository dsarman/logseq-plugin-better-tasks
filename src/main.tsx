import '@logseq/libs';

import { logseq as PL } from '../package.json';
import { DayType, getStartingDay } from './config';
import { getGraphData } from './heatmap/heatmapData';
import { getGridTemplate, getHeatmapStyle } from './heatmap/heatmapTemplate';
import { toggleExpanded, toggleTaskRecord } from './heatmap/heatmapHelpers';
import { getTaskStats } from './task-summary/taskSummaryData';
import {
  getTaskStatsTemplate,
  getTaskStatusStyle,
} from './task-summary/taskSummaryTemplate';

const pluginId = PL.id;
const BLOCK_NAME = 'better-tasks';
const TASK_SUMMARY = 'better-tasks-summary';

const renderHeatmap = async (
  uuid: string,
  slot: string,
  startingDay?: DayType
) => {
  const startDay = startingDay ?? (await getStartingDay());
  const content = await getGraphData(uuid, startDay);
  if (!content) {
    return;
  }

  const template = getGridTemplate(content, uuid, slot);

  logseq.provideUI({
    key: BLOCK_NAME + '__' + uuid,
    slot,
    reset: true,
    template,
  });

  return;
};

const renderTaskSummary = async (uuid: string, slot: string) => {
  const taskStats = await getTaskStats(uuid);
  const template = getTaskStatsTemplate(taskStats);

  logseq.provideUI({
    key: BLOCK_NAME + '__' + uuid,
    slot,
    reset: true,
    template,
  });
};

const main = async () => {
  console.info(`#${pluginId}: MAIN`);

  logseq.provideStyle(`
    .better-tasks-container {
      display: flex;
      flex-direction: row;
      left: -20px;
      top: 5px;
      position: relative;
    }

    .better-tasks-toggle-heatmap {
      align-self: flex-start;
    }
    
    ${getHeatmapStyle()}
    ${getTaskStatusStyle()}
  `);

  logseq.provideModel({
    toggleHeatmap: async (e: any) => {
      const { uuid } = e.dataset;
      await toggleExpanded(uuid);
    },
    toggleTaskRecord: async (e: any) => {
      const { uuid, date, slot } = e.dataset;

      const dateObj = new Date(date);
      await toggleTaskRecord(uuid, dateObj);
      await renderHeatmap(uuid, slot);
    },
  });

  const startingDay = await getStartingDay();

  logseq.App.onMacroRendererSlotted(
    async ({ slot, payload }): Promise<void> => {
      const [type] = payload.arguments;
      if (!type.startsWith(BLOCK_NAME)) {
        return;
      } else if (type === BLOCK_NAME) {
        renderHeatmap(payload.uuid, slot, startingDay);
      } else if (type === TASK_SUMMARY) {
        renderTaskSummary(payload.uuid, slot);
      }
    }
  );
};

logseq.ready(main).catch(console.error);
