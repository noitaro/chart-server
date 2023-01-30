import "./style.css";
import { NightVision } from "night-vision";
import { DataLoader } from "./dataLoader.js";
import wsx from "./wsx.js";
import sampler from "./ohlcvSampler.js";

document.querySelector("#app").innerHTML = `
<style>
body {
    background-color: #0c0d0e;
}
</style>
<div class="button-group">
</div>
<div id="chart-container"></div>
`;

function el(id) {
  return document.getElementById(id);
}

const chart = new NightVision("chart-container", {
  autoResize: true,
  colors: {
    back: "#111113",
    grid: "#2e2f3055"
  }
});

const dl = new DataLoader();

// Load the first piece of the data
dl.load((data) => {
  chart.data = data;
});

// Load deeper into the history
function loadMore() {
  if (!chart.hub.mainOv) return;
  const data = chart.hub.mainOv.data;
  const t0 = data[0][0];
  if (chart.range[0] < t0) {
    dl.loadMore(t0 - 1, 500, (chunk) => {
      // Add a new chunk at the beginning
      data.unshift(...chunk);
      // Yo need to update "range"
      // when the data range is changed
      chart.update("data");
    });
  }
}

// Load new data when user scrolls left
chart.events.on("app:$range-update", loadMore);

// Plus check for updates every second
setInterval(loadMore, 500);

// Setup a trade data stream
wsx.init(["APE-PERP"]);
wsx.ontrades = (d) => {
  if (!chart.hub.mainOv) return;
  const ohlcv = chart.hub.mainOv.data;
  const trade = {
    time: d.t,
    open: parseFloat(d.o),
    high: parseFloat(d.h),
    low: parseFloat(d.l),
    close: parseFloat(d.c),
    volume: parseFloat(d.q)
  };

  let last = ohlcv[ohlcv.length - 1];
  if (last[0] == trade.time) {
    // Update an existing one
    last[2] = Math.max(trade.high, last[2]);
    last[3] = Math.min(trade.low, last[3]);
    last[4] = trade.close;
    last[5] = trade.volume;
    chart.update(); // Candle update
  } else {
    // And new zero-height candle
    const nc = [
      trade.time,
      trade.open,
      trade.high,
      trade.low,
      trade.close,
      trade.volume,
      new Date(trade.time).toISOString(),
    ];
    console.log(nc);
    //callback('candle-close', symbol)
    ohlcv.push(nc);
    // Make update('range')
    chart.update("data"); // New candle
  }
};

// Refernce for experiments
window.chart = chart;
