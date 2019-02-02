import React, {Component} from "react";
import {Link} from "react-router-dom";
import Data from "../data";
import {Button, Input, InputGroup, InputGroupAddon} from "reactstrap";

import "../Style/SetupList.css";

class SetupList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {}
    };
    this.wsInit = this.wsInit.bind(this);
  }

  componentDidMount() {
    document.title = "List all public games";
    this.wsInit();
  }

  componentWillUnmount() {
    if (this.ws) this.ws.close(3001, "going away, cya");
  }

  wsInit() {
    if (this.ws && (this.ws.readyState === 1 || this.ws.readyState === 0)) return;
    if (this.ws) this.ws.close(3012, "restarting, brb");
    this.ws = new WebSocket(Data.wsAddr);
    this.ws.onopen = () => {
      this.ws.send(`new:hub`);
    };
    this.ws.onmessage = msg => {
      let m = msg.data;
      if (m.startsWith("d:")) {
        const d = JSON.parse(m.substring(2));
        this.setState({data: d});
      }
    };
    this.ws.onerror = console.error;
  }

  joinGame(e) {
    e.preventDefault();
    console.log(e.target.tagName);
  }

  render() {
    return <div className="game-container">
      <div className="container-fluid">
        <h2>List public games <small><Link to={"/"}>Back</Link></small></h2>
        {this.state.data ? (Object.keys(this.state.data).length ?
          Object.keys(this.state.data).map(v => {
            const g = this.state.data[v];
            return <div key={v}><Link to={`/setup/join/${v}`}>{g.name}</Link> by {g.host} ({g.players.length}/{g.maxPlayers})</div>
          })
        : "No games currently started") : "Searching for games..."}
      </div>
      <form onSubmit={this.joinGame.bind(this)} className="setup-by-id">
        <InputGroup>
          <Input placeholder="Join game using ID"/>
          <InputGroupAddon addonType={"append"}><Button>Go</Button></InputGroupAddon>
        </InputGroup>
      </form>
    </div>;
  }
}

export default SetupList;