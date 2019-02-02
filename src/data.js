const data = {
    wsAddr: process.env.REACT_APP_WSS === "local" ? `ws://${process.env.REACT_APP_IP}:8888/game1/` : "ws://mc.nav.lv:8888/game1/",
    debug:  process.env.NODE_ENV      === "development",
    log: () => {}
};

if (data.debug) {
    data.log = console.log;
}

export default data;