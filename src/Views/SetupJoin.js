import React, {Component} from "react";
import {Link} from "react-router-dom";
import {Button} from "reactstrap";
import {withCookies} from "react-cookie";
import MainContext from "../Contexts/MainContext";
import Data from "../data";

class SetupJoin extends Component {
  constructor(props) {
    super(props);
    this.cookies = this.props.cookies;
    this.state = {
      password: "",
      hidePass: true,
      username: this.cookies.get("username") || "",
      remember: false,
      verify: {username: "", password: ""},
      // verifyFeedback: {}
    };
    this.handleChange = this.handleChange.bind(this);
    this.wsInit = this.wsInit.bind(this);
    this.handleCheck = this.handleCheck.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    document.title = "Join an existing game";
    this.wsInit();
  }

  componentWillUnmount() {
    if (this.ws) this.ws.close(3001, "going away, cya");
  }

  handleChange({target}) {
    this.setState({[target.name]: target.value});
  }
  handleCheck({target}) {
    this.setState({[target.name]: target.checked});
  }

  wsInit() {
    if (this.ws && (this.ws.readyState === 1 || this.ws.readyState === 0)) return;
    if (this.ws) this.ws.close(3012, "restarting, brb");
    this.ws = new WebSocket(Data.wsAddr);
    this.ws.onopen = () => {
      this.ws.send(`new:join:${this.props.match.params.id}`);
    };
    this.ws.onmessage = msg => {
      let m = msg.data;
      if (!m.startsWith("ping:")) Data.log(msg);
      if (m.startsWith("u:")) {
        m = m.substring(2);
        if (m === "404") {
          this.props.context.redirectTo("/", "Game has ended or does not exist", "danger");
        }
      } else if (m.startsWith("d:")) {
        const d = JSON.parse(m.substring(2));
        this.setState({data: d});
      }
    };
    this.ws.onerror = console.error;
  }

  handleSubmit(e) {
    if (e.target.tagName === "FORM") e.preventDefault();
    const {id} = this.props.match.params;
    const verify = this.state.verify;
    let valid = true;
    const set = (b) => {
      valid = valid && b;
      return b ? " is-valid" : " is-invalid";
    };
    verify.username = set(this.state.username.length > 0 && (this.state.username) && !this.state.data.players.includes(this.state.username));
    verify.password = set(this.state.password.length === 0 || this.state.password === this.state.data.password);
    if (!valid) {
      console.log(this.state.username, this.state.password, this.state.data.players);
      this.setState({verify: verify});
    } else {
      if (this.state.remember) {
        const d = new Date();
        d.setFullYear(d.getFullYear() + 1);
        this.cookies.set("username", this.state.username, {expires: d});
      }
      this.props.context.setData({
        password: this.state.password,
        username: this.state.username
      });
      this.props.context.redirectTo(`/play/${id}`);
    }
  }

  render() {
    return <form onSubmit={this.handleSubmit}>
      <h2>Joining "{this.state.data ? this.state.data.name : <i>[LOADING NAME]</i>}" <small><Link to={"/setup/list"}>Back</Link></small></h2>
      <label htmlFor="username">Your player name: </label>
      <input type="text" name="username" className={"form-control" + this.state.verify.username} id="username" value={this.state.username} onChange={this.handleChange} required autoFocus/>
      <input type="checkbox" id="remember" name="remember" value={this.state.remember} onChange={this.handleCheck}/>
      <label htmlFor="remember"> Remember username</label>
      <br/>
      <label htmlFor="password">Password (leave blank if none): </label>
      <input type="password" name="password" className={"form-control" + this.state.verify.password} id="password" value={this.state.password} onChange={this.handleChange}/>
      <br/>
      {/*<Button color="success" onClick={this.handleSubmit}>Start</Button>*/}
      <Button color="success" type="submit">Start</Button>
    </form>;
  }
}

export default withCookies((props) => <MainContext.Consumer>{context => <SetupJoin {...props} context={context}/>}</MainContext.Consumer>);