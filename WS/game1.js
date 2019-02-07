const games = {};
const games_l = {};
const games_d = {};
let hubs = [];
const players = {};
let id_iter = 1;
const log = (...d) => console.log("[game1]", ...d);
const game1Event = require("./game1_event");
const handle = (conn, req) => {
  let key = req.headers["sec-websocket-key"];

  log(`open: ${key}`);

  conn.on("message", m => {
    if (!m.startsWith("ping:") && !m.startsWith("u:") && !m.startsWith("e:")) log(m);
    if (m.startsWith("ping:")) {
      conn.send(m);
    } else if (m.startsWith("u:")) { // updated data -> u: & save
      const id = parseInt(m.split(":")[1]), d = m.substring(3+m.split(":")[1].length);
      games_d[id] = Object.assign(games_d[id] || {}, JSON.parse(d));
      if (!games_l[id]) return;
      for (const c of games_l[id].players) if (c.readyState === 1) c.send(`u:${d}`);
    } else if (m.startsWith("e:")) { // event -> e:
      const id = parseInt(m.split(":")[1]);
      if (game1Event(games_d[id], m)) {
        for (const c of games_l[id].players)
          if (c.readyState === 1) c.send(`u:${JSON.stringify(games_d[id])}`);
      }
      for (const c of games_l[id].players) if (c.readyState === 1) c.send(m);
    } else if (m.startsWith("new:")) {
      m = m.substring(4);
      if (m.startsWith("hub")) {
        conn.send("d:" + JSON.stringify(games));
        hubs.push(conn);
      } else if (m.startsWith("join:")) {
        const id = parseInt(m.substring(5), 10);
        if (!games[id]) conn.send("u:404");
        else conn.send("d:" + JSON.stringify(games[id]));
      } else if (m.startsWith("cli:")) {
        const [id_s, username, password] = m.substring(4).split(":");
        const id = parseInt(id_s, 10);
        if (!games[id]) conn.send("u:404");
        else if (games[id].players.includes(username)) conn.send("u:taken");
        else if (games[id].password.length > 0 && games[id].password !== password) conn.send("u:invalid");
        else if (games[id].players.length >= games[id].maxPlayers) conn.send("u:full");
        else {
          games[id].players.push(username);
          players[key] = {id: id, username: username};
          games_l[id].players.push(conn);
          for (const c of games_l[id].players) {
            c.send("d:" + JSON.stringify(games[id]));
            c.send(`u:${JSON.stringify(games_d[id])}`);
          }
        }
      } else if (m.startsWith("host:")) {
        const id = id_iter++;
        games[id] = JSON.parse(m.substring(5)); // keys: [name, maxPlayers, private, password, username]
        games[id].players = [games[id].username];
        games[id].id = id;
        games[id].host = games[id].username;
        players[key] = {id: id, username: games[id].username};
        delete games[id].username;
        conn.send("d:" + JSON.stringify(games[id]));
        conn.send(`u:{}`);
        games_l[id] = {host: conn, players: [conn]};
        games_d[id] = {};
        for (const cn of hubs) if (cn.readyState === 1) cn.send("d:" + JSON.stringify(games));
      }
    }
  });

  conn.on("close", code => {
    log(`closed: ${key}; reason: ${code}`);
    hubs = hubs.filter(cn => cn !== conn);
    if (Object.keys(players).includes(key)) {
      const p = players[key];
      if (games[p.id]) {
        games[p.id].players = games[p.id].players.filter(un => un !== p.username);
        if (games_l[p.id].host === conn) {
          for (const c of games_l[p.id].players) if (c.readyState === 1) c.send("u:404");
          delete games[p.id];
          delete games_l[p.id];
        } else if (games_l[p.id].players.includes(conn)) {
          games_l[p.id].players = games_l[p.id].players.filter(cn => cn !== conn);
          // if (games_d[p.id][p.username]) games_d[p.id][p.username] = undefined;
          if (games_d[p.id][p.username]) delete games_d[p.id][p.username];
          for (const c of games_l[p.id].players) {
            if (c.readyState === 1) {
              c.send("d:" + JSON.stringify(games[p.id]));
              c.send(`u:rewrite:${JSON.stringify(games_d[p.id])}`);
            }
          }
        }
      }
    }
    for (const cn of hubs) if (cn.readyState === 1) cn.send("d:" + JSON.stringify(games));
  });
};

module.exports = {
  path: "/game1/",
  handle: handle
};