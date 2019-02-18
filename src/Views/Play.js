import React, {Component} from "react";
import {Link} from "react-router-dom";
import MainContext from "../Contexts/MainContext";
import Data from "../data";
import GameWrapper from "./GameWrapper";
import {PROPS} from "./Game";

class Play extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: undefined,
      loading: true,
      ping: [],
      players: [{}],
      data: {},
      gameData: {},
      callback: () => {},
      initCall: () => {},
      initCalled: false
    };
    this.wsInit = this.wsInit.bind(this);
  }

  componentDidMount() {
    document.title = "Play";
    if (this.props.context.data) {
      this.setState({data: {maxPlayers: this.props.context.data.maxPlayers, username: this.props.context.data.username}});
      // console.log("ws init");
      this.wsInit();
    // } else if (Data.debug && document.location.pathname === "/play") {
    //   this.props.context.redirectTo("/startDEV");
    } else {
      this.props.context.redirectTo("/");
    }
  }
  componentWillUnmount() {
    if (this.ws) this.ws.close(3001, "going away, cya");
    if (this.state.pingTimer) clearTimeout(this.state.pingTimer);
  }

  wsInit() {
    console.log("init ws", new Date().getTime(), this.ws);
    const {id} = this.props.match.params;
    const {data} = this.props.context;
    this.setState({username: data.username});
    if (this.ws && (this.ws.readyState === 1 || this.ws.readyState === 0)) return;
    if (this.ws) this.ws.close(3012, "restarting, brb");
    this.ws = new WebSocket(Data.wsAddr);
    this.ws.onopen = () => {
      // console.log(this.ws);
      if (id) this.ws.send(`new:cli:${id}:${data.username}:${data.password || ""}`);
      else if (data) this.ws.send(`new:host:${JSON.stringify(data)}`);
      this.ws.send(`ping:${new Date().getTime()}`);
      // this.state.initCall();
      this.setState({loading: false});
    };
    this.ws.onmessage = msg => {
      let m = msg.data;
      if (!m.startsWith("ping:") && !m.startsWith("u:") && !m.startsWith("e:")) Data.log(msg);
      if (m.startsWith("u:")) {
        m = m.substring(2);
        if (m === "404") {
          this.props.context.redirectTo("/", "Game has ended or does not exist", "danger");
        } else if (m === "taken") {
          this.props.context.redirectTo(`/setup/join/${id}`, "Username already taken", "danger");
        } else if (m === "full") {
          this.props.context.redirectTo(`/`, "Server full", "danger");
        } else {
          const b = m.split(":")[0] === "rewrite";
          if (b) m = m.substring(8);
          // console.log(m);
          const d = JSON.parse(m);
          this.setState(s => ({gameData: b ? d : Object.assign(s.gameData, d)}), () => {
            if (!this.state.initCalled) {
              this.state.initCall();
              this.setState({initCalled: true});
            }
          });
          if (d[this.state.username] && !d[this.state.username].x)
            this.wsSend("u", {[this.state.username]: Object.assign(PROPS.defaultValue(), d[this.state.username])});
        }
      } else if (m.startsWith("d:")) {
        this.setState({data: JSON.parse(m.substring(2))});
      } else if (m.startsWith("e:")) {
        this.state.callback(m.substring(2));
      } else if (m.startsWith("ping:")) {
        const ping = this.state.ping;
        ping.push(new Date().getTime() - parseInt(m.substring(5)));
        while (ping.length > 10) ping.shift();
        this.setState({
          ping: ping,
          pingTimer: setTimeout(this.sendPing.bind(this), 100)
        })
      }
    };
    this.ws.onerror = console.error;
  }

  sendPing() {
    if (this.ws.readyState === 1)
      this.ws.send(`ping:${new Date().getTime()}`);
  }
  wsSend(t, m) {
    if (!this.ws || this.ws.readyState !== 1 || !this.state.data.id) setTimeout(() => this.wsSend(t, m), 10);
    else this.ws.send(`${t}:${this.state.data.id}:${JSON.stringify(m)}`);
  }

  bindListener(q) {
    this.setState({callback: q});
  }
  initListener(q) {
    this.setState({initCall: q});
  }
  updateData(d) {
    this.setState({gameData: d});
  }

  render() {
    return <div>
      <h2 className="title">Game [{this.state.data.id || "?"}]
        <small><Link to={"/"}>Back</Link></small>
      </h2>
      {
        this.state.loading ?
          <div className="title">
            <h4>Joining game '{this.props.match.params.id}'...</h4>
            Please wait
          </div> : <div className="title"><h4>{this.state.data.name}</h4></div>
      }
      <div className="row">
        <GameWrapper loading={this.state.loading} data={this.state.gameData} me={this.state.username}
                     host={this.state.data.host}
                     wsSend={this.wsSend.bind(this)} bindListener={this.bindListener.bind(this)}
                     initListener={this.initListener.bind(this)} updateData={this.updateData.bind(this)}/>
        <div className="col">
          <p>
            Current Players ({(this.state.data.players || []).length}/{this.state.data.maxPlayers || "?"}):<br/>
            {(this.state.data.players || []).map((v, k) => <span key={k}>{v}<br/></span>)}
          </p>
          <p>Ping: {this.state.ping.length === 0 ? "?" : (this.state.ping.reduce((p, c) => p + c, 0) / this.state.ping.length).toFixed(1)}ms</p>
        </div>
      </div>
    </div>;
  }
}

export default (props) => <MainContext.Consumer>{context => <Play {...props} context={context}/>}</MainContext.Consumer>;