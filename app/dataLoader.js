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
