import '@logseq/libs';

import { logseq as PL } from '../package.json';
import { DayType, getStartingDay } from './config';
import { getGraphData } from './heatmap/heatmapData';
import { getGridTemplate, getHeatmapStyle } from './heatmap/heatmapTemplate';
import { toggleExpanded, toggleTaskRecord } from './heatmap/heatmapHelpers';

const pluginId = PL.id;
const BLOCK_NAME = 'better-tasks';

const render = async (uuid: string, slot: string, startingDay?: DayType) => {
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

const main = async () => {
  console.info(`#${pluginId}: MAIN`);

  logseq.provideStyle(`
    .better-tasks-container {
      display: flex;
      flex-direction: row;
      left: -20px;src/config.ts
      top: 5px;
      position: relative;
    }

    .better-tasks-toggle-heatmap {
      align-self: flex-start;
    }
    
    ${getHeatmapStyle()}
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
      await render(uuid, slot);
    },
  });

  const startingDay = await getStartingDay();

  logseq.App.onMacroRendererSlotted(
    async ({ slot, payload }): Promise<void> => {
      const [type] = payload.arguments;
      if (!type.startsWith(BLOCK_NAME)) {
        return;
      }

      render(payload.uuid, slot, startingDay);
    }
  );
};

logseq.ready(main).catch(console.error);
