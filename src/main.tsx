import "@logseq/libs";

import React from "react";
import App from "./App";
import "./index.css";
import ReactDOMServer from "react-dom/server";

import { logseq as PL } from "../package.json";

const pluginId = PL.id;

function main() {
  console.info(`#${pluginId}: MAIN`);

  logseq.App.onMacroRendererSlotted(async ({slot, payload}) => {
    const [type] = payload.arguments;
    if (type.startsWith("task-heatmap")) {
      const template = ReactDOMServer.renderToStaticMarkup(
        <App />
      )

      logseq.provideUI({
        key: "task-heatmap" + "__" + slot,
        slot,
        reset: true,
        template
      })

      return true;
    }
  })
}

logseq.ready(main).catch(console.error);
