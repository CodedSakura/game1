const app = require("express")();
const wsInstance = require("express-ws")(app);
const handles = [
	require("./game1")
];

app.use((req, res, next) => next());

for (const h of handles) {
  app.ws(h.path, h.handle);
}

app.ws('/ping', ws => {
	ws.on("message", msg => {
		ws.send(msg);
	});
});

app.ws('/', (ws, req) => {
	const key = req.headers["sec-websocket-key"];
	console.log(`[/] open: ${key}`);

	ws.on("message", msg => {
		if (msg === "websockets") {
			ws.send(`${wsInstance.getWss().clients.size}`);
			console.log("[/]", wsInstance.getWss().clients.size);
		}
	})
});

app.listen(8888);
