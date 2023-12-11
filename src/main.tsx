import '@logseq/libs';

import { logseq as PL } from '../package.json';
import { getStartingDay } from './config';
import { getGraphData, toggleExpanded } from './heatmap/heatmapData';
import { getGridTemplate, getHeatmapStyle } from './heatmap/heatmapTemplate';

const pluginId = PL.id;
const BLOCK_NAME = 'better-tasks';


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
    }
  });

  const startingDay = await getStartingDay();

  logseq.App.onMacroRendererSlotted(async ({ slot, payload }) => {
    const [type] = payload.arguments;

    if (type.startsWith(BLOCK_NAME)) {
      const content = await getGraphData(payload.uuid, startingDay);
      if (!content) {
        return false;
      }

      const template = getGridTemplate(content, payload.uuid);

      logseq.provideUI({
        key: BLOCK_NAME + '__' + slot,
        slot,
        reset: true,
        template
      });

      return true;
    }
  });
};

logseq.ready(main).catch(console.error);
