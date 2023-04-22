import "@logseq/libs";

import React from "react";
import App from "./App";
import "./index.css";
import ReactDOMServer from "react-dom/server";

import {logseq as PL} from "../package.json";
import {getLogbook} from "./data";

const pluginId = PL.id;

const main = () => {
    console.info(`#${pluginId}: MAIN`);

    logseq.provideStyle(`
}
  `)

    logseq.App.onMacroRendererSlotted(async ({slot, payload}) => {
        const [type] = payload.arguments;
        if (type.startsWith("task-heatmap")) {
            const content = await getLogbook(payload.uuid);
            if (!content) {
                return false;
            }

            const template = ReactDOMServer.renderToStaticMarkup(
                <App data={content}/>
            );

            logseq.provideUI({
                key: "task-heatmap" + "__" + slot,
                slot,
                reset: true,
                template,
            });

            return true;
        }
    });
};

logseq.ready(main).catch(console.error);
