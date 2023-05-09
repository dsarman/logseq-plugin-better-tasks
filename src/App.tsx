import React from "react";
import { Data, xLabels, yLabels } from "./data";
import { HeatMapGrid } from "react-grid-heatmap";
import { format } from "date-fns";
import { getDateFromWeekAndDay } from "./utils";

type InteractionData = {
  xLabel: string;
  yLabel: string;
  xPos: number;
  yPos: number;
  value: number;
};


type AppProps = {
  data: Data
};

const baseSize = 0.9;

const App = ({ data }: AppProps) => {
  return (
    <div
      style={{
        width: "100%",
        fontFamily: "sans-serif"
      }}
    >
      <HeatMapGrid
        data={data}
        xLabels={xLabels}
        yLabels={yLabels}
        // Reder cell with tooltip
        cellRender={(x, y, value) => (
          <div title={format(getDateFromWeekAndDay(y, x), "yyyy/MM/dd")} style={{ width: "100%", height: "100%" }} />
        )}
        xLabelsStyle={index => ({
          color: index % 2 ? "transparent" : "#777",
          fontSize: ".65rem",
          whiteSpace: "nowrap"
        })}
        yLabelsStyle={() => ({
          fontSize: ".65rem",
          textTransform: "uppercase",
          color: "#777",
          whiteSpace: "nowrap"
        })}
        cellStyle={(_x, _y, ratio) => ({
          background: `rgb(12, 160, 44, ${ratio})`,
          fontSize: ".7rem",
          color: `rgb(0, 0, 0, ${ratio / 2 + 0.4})`
        })}
        cellHeight={`${baseSize}rem`}
        xLabelsPos="bottom"
        onClick={(x, y) => alert(`Clicked (${x}, ${y})`)}
        square
      />
    </div>
  );
};

export default App;
