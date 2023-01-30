import wsx from "./wsx.js";

class DataLoader {
  constructor() {
    this.URL = "https://api1.binance.com/api/v3/klines";
    this.SYM = "BTCUSDT";
    this.TF = "1m"; // See binance api definitions

    this.loading = false;
  }

  async load(callback) {
    const url = `${this.URL}?symbol=${this.SYM}&interval=${this.TF}`;
    const result = await fetch(url);
    const data = await result.json();
    const callbackData = data.map((x) => this.format(x));
    // console.log("load", callbackData);
    callback({
      panes: [
        {
          overlays: [
            {
              name: "BTC Tether US Binance",
              type: "Candles",
              data: callbackData
            }
          ]
        }
      ]
    });
  }

  async loadMore(endTime, limit, callback) {
    if (this.loading) return;
    this.loading = true;
    const url = `${this.URL}?symbol=${this.SYM}&interval=${this.TF}&endTime=${endTime}&limit=${limit}`;
    const result = await fetch(url);
    const data = await result.json();
    const callbackData = data.map((x) => this.format(x));
    // callback(callbackData);
    this.loading = false;
  }

  wsxInit() {
    wsx.init(["APE-PERP"]);
    wsx.ontrades = (data) => {
      if (!chart.hub.mainOv) return;
      const ohlcv = chart.hub.mainOv.data;
      let last = ohlcv[ohlcv.length - 1];
      if (last[0] <= data.time) {
        // Update an existing one
        last[2] = Math.max(data.high, last[2]);
        last[3] = Math.min(data.low, last[3]);
        last[4] = data.close;
        last[5] = data.volume;
        chart.update(); // Candle update
      } else {
        // And new zero-height candle
        const nc = [
          data.time,
          data.open,
          data.high,
          data.low,
          data.close,
          data.volume,
          new Date(data.time).toISOString(),
        ];
        console.log(nc);
        //callback('candle-close', symbol)
        ohlcv.push(nc);
        // Make update('range')
        chart.update("data"); // New candle
      }
    };
  }

  format(x) {
    return [
      x[0],
      parseFloat(x[1]),
      parseFloat(x[2]),
      parseFloat(x[3]),
      parseFloat(x[4]),
      parseFloat(x[7]),
      new Date(x[0]).toISOString(),
    ];
  }
}

export { DataLoader };
