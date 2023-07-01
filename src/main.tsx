import '@logseq/libs';

import React from 'react';
import ReactDOMServer from 'react-dom/server';

import { logseq as PL } from '../package.json';
import { getGraphData, toggleExpanded } from './heatmap/data';
import { GraphComponent } from './heatmap/HeatmapComponent';

const pluginId = PL.id;
const BLOCK_NAME = 'better-tasks';
//const laxTag = '#lax';

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
  `);

  logseq.provideModel({
    toggleHeatmap: async (e: any) => {
      const { uuid } = e.dataset;
      await toggleExpanded(uuid);
    },
  });

  const config = await logseq.App.getUserConfigs();
  console.info(config);

  logseq.App.onMacroRendererSlotted(async ({ slot, payload }) => {
    const [type] = payload.arguments;
    if (type.startsWith(BLOCK_NAME)) {
      const content = await getGraphData(payload.uuid);
      if (!content) {
        return false;
      }

      const heatmap = ReactDOMServer.renderToStaticMarkup(
        <GraphComponent data={content} />
      );

      const template = `<div class="better-tasks-container">
      <button
        class="better-tasks-toggle-heatmap"
        data-uuid="${payload.uuid}"
        data-on-click="toggleHeatmap"
        >${content.isExpanded ? '▼' : '▶︎'}</button>
      ${heatmap}
      </div>`;

      logseq.provideUI({
        key: BLOCK_NAME + '__' + slot,
        slot,
        reset: true,
        template,
      });

      return true;
    }
  });

  //TODO: Complete this
  /*
  logseq.DB.onChanged(async ({ blocks, txData, txMeta }) => {
    if (txMeta?.outlinerOp !== 'saveBlock') return;

    const taskBlock = blocks[0];
    if (!taskBlock) return;
    if (!taskBlock['repeated?']) return;
    if (!taskBlock.content.includes(laxTag)) return;

    const scheduled = taskBlock.scheduled;
    if (!scheduled) return;
    console.info(scheduled);
    const curentDate = getCurrentDateNumber();
    console.info(curentDate);
    const scheduledIsInFuture = scheduled > curentDate;
    if (scheduledIsInFuture) return;
    const blockUuid = taskBlock.uuid;
    if (!blockUuid) return;
    console.info(taskBlock.content);
    await logseq.Editor.updateBlock(blockUuid, taskBlock.content, {
      properties: { scheduled: curentDate },
    });

    console.info(blocks);
    console.info(txData);
    console.info(txMeta);
  });
  */
};

logseq.ready(main).catch(console.error);
