var last_event = Infinity;
var ws = null;
var _ontrades = () => {};
var _onquotes = () => {};
var _onready = () => {};
var _onrefine = () => {};
var reconnecting = false;
var ready = false;

function now() {
  return new Date().getTime();
}

async function init(syms) {
  if (ready) return;

  start_hf();
}

function start_hf() {

  ws = new WebSocket(`wss://stream.binance.com:9443/ws/btcusdt@kline_1m`);
  ws.onmessage = function (e) {
    try {
      const data = JSON.parse(e.data);
      if (!data.k) return print(data);
      _ontrades(data.k);
      last_event = now();
    } catch (e) {
      // log
      console.log(e.toString());
    }
  };
  ws.onclose = function (e) {
    switch (e) {
      case 1000:
        console.log("WebSocket: closed");
        break;
    }
    reconnect();
  };
  ws.onerror = function (e) {
    console.log("WS", e);
    reconnect();
  };
}

function reconnect() {
  reconnecting = true;
  console.log("Reconnecting...");
  try {
    ws.close();
    // ws.removeAllListeners();
    setTimeout(() => start_hf(), 1000);
  } catch (e) {
    console.log(e.toString());
  }
}

function print(data) {
  if (data.type === "subscribed") {
    // TODO: refine the chart
    if (reconnecting) {
      _onrefine();
    } else if (!ready) {
      console.log("Stream [OK]");
      _onready();
      ready = true;
      last_event = now();
      setTimeout(heartbeat, 10000);
    }
    reconnecting = false;
  }
}

function heartbeat() {
  if (now() - last_event > 60000) {
    console.log("No events for 60 seconds");
    if (!reconnecting) reconnect();
    setTimeout(heartbeat, 10000);
  } else {
    setTimeout(heartbeat, 1000);
  }
}

export default {
  init,
  reconnect,
  set ontrades(val) {
    _ontrades = val;
  },
  set ready(val) {
    _onready = val;
  }
};
