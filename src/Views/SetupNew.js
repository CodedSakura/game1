import React, {Component} from "react";
import {Link} from "react-router-dom";
import {Button} from "reactstrap";
import MainContext from "../Contexts/MainContext";
import {withCookies} from "react-cookie";

class SetupNew extends Component {
  constructor(props) {
    super(props);
    this.cookies = this.props.cookies;
    this.state = {
      name: "",
      maxPlayers: 4,
      "private": false,
      password: "",
      hidePass: false,
      remember: false,
      username: this.cookies.get("username") || "",
      verify: {name: "", username: "", maxPlayers: "", password: ""},
      // verifyFeedback: {}
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.handleCheck = this.handleCheck.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    document.title = "Setup new game";
  }

  handleChange({target}) {
    this.setState({[target.name]: target.value});
  }

  handleCheck({target}) {
    this.setState({[target.name]: target.checked});
  }

  handleSubmit(e) {
    if (e.target.tagName === "FORM") e.preventDefault();
    const verify = this.state.verify;
    let valid = true;
    const set = (b) => {
      valid = valid && b;
      return b ? " is-valid" : " is-invalid";
    };
    verify.maxPlayers = set(this.state.maxPlayers >= 1 && this.state.maxPlayers <= 10);
    verify.name = set(this.state.name.length > 0);
    verify.username = set(this.state.username.length > 0);
    verify.password = " is-valid";
    if (!valid) this.setState({verify: verify});
    else {
      if (this.state.remember) {
        const d = new Date();
        d.setFullYear(d.getFullYear() + 1);
        this.cookies.set("username", this.state.username, {expires: d});
      }
      this.props.context.setData({
        name: this.state.name,
        maxPlayers: this.state.maxPlayers,
        "private": this.state["private"],
        password: this.state.password,
        username: this.state.username
      });
      this.props.context.redirectTo("/play");
    }
  }

  handleScroll(e) {
    const {target, deltaY} = e;
    e.preventDefault();
    this.setState(state => (
      {[target.name]: Math.max(Math.min(state[target.name] - Math.sign(deltaY), target.max), target.min)}
    ));
  }

  render() {
    return <form onSubmit={this.handleSubmit}>
      <h2>Creating a new game <small><Link to={"/"}>Back</Link></small></h2><br/>
      <label htmlFor="name">Name of the game: </label>
      <input type="text" name="name" className={"form-control" + this.state.verify.name} id="name" value={this.state.name} onChange={this.handleChange} required/>
      <br/>
      <label htmlFor="maxPlayers">Max players: </label>
      <input type="number" max="10" min="1" name="maxPlayers" className={"form-control" + this.state.verify.maxPlayers} id="maxPlayers" value={this.state.maxPlayers} onChange={this.handleChange} onWheelCapture={this.handleScroll}/>
      <br/>
      <input type="checkbox" id="private" name="private" value={this.state.private} onChange={this.handleCheck}/>
      <label htmlFor="private"> Private game</label>
      <br/>
      <label htmlFor="password">Password (leave blank for none): </label>
      <input type={this.state.hidePass ? "password" : "text"} name="password" className={"form-control" + this.state.verify.password} id="password" value={this.state.password} onChange={this.handleChange}/>
      <input type="checkbox" id="hidePass" name="hidePass" value={this.state.hidePass} onChange={this.handleCheck}/>
      <label htmlFor="hidePass"> Hide password</label>
      <hr/>
      <label htmlFor="username">Your player name: </label>
      <input type="text" name="username" className={"form-control" + this.state.verify.username} id="username" value={this.state.username} onChange={this.handleChange} required/>
      <input type="checkbox" id="remember" name="remember" value={this.state.remember} onChange={this.handleCheck}/>
      <label htmlFor="remember"> Remember username</label>
      <br/>
      <Button type="submit" color="success" onClick={this.handleSubmit}>Start</Button>
    </form>;
  }
}

export default withCookies((props) => <MainContext.Consumer>{context => <SetupNew {...props} context={context}/>}</MainContext.Consumer>);