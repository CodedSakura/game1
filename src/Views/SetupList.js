import React, {Component} from "react";
import {Link} from "react-router-dom";
import Data from "../data";
import {Button, Input, InputGroup, InputGroupAddon} from "reactstrap";

import "../Style/SetupList.css";
import MainContext from "../Contexts/MainContext";

class SetupList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      joinID: ""
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
    if (!this.state.joinID) return;
    this.props.context.redirectTo(`/setup/join/${this.state.joinID}`);
  }

  handleChange({target}) {
    this.setState({[target.name]: target.value});
  }

  handleScroll(e) {
    const {target, deltaY} = e;
    e.preventDefault();
    this.setState(state => (
      {[target.name]: Math.max(Math.min((state[target.name] || 0) - Math.sign(deltaY), target.max || Infinity), target.min)}
    ));
  }

  render() {
    return <div className="game-container">
      <div className="container-fluid">
        <h2>List public games <small><Link to={"/"}>Back</Link></small></h2>
        {this.state.data ? (Object.keys(this.state.data).filter(v => !this.state.data[v].private).length ?
          Object.keys(this.state.data).map(v => {
            const g = this.state.data[v];
            if (g.private) return undefined;
            return <div key={v}><Link to={`/setup/join/${v}`}>{g.name}</Link> by {g.host} ({g.players.length}/{g.maxPlayers})</div>
          })
        : "No games currently started") : "Searching for games..."}
      </div>
      <form onSubmit={this.joinGame.bind(this)} className="setup-by-id">
        <InputGroup>
          <Input placeholder="Join game using ID" type="number" value={this.state.joinID} name={"joinID"}
                 onChange={this.handleChange.bind(this)} onWheelCapture={this.handleScroll.bind(this)} min={0}/>
          <InputGroupAddon addonType={"append"}><Button type="submit">Go</Button></InputGroupAddon>
        </InputGroup>
      </form>
    </div>;
  }
}

export default (props) => <MainContext.Consumer>{context => <SetupList {...props} context={context}/>}</MainContext.Consumer>;