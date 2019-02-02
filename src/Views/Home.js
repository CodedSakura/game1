import React, {Component} from "react";
import {Link} from "react-router-dom";
import MainContext from "../Contexts/MainContext";

class Home extends Component {
  componentDidMount() {
    document.title = "Home";
  }

  render() {
    return <div>
      <Link to={"/setup/new"}>Start new game</Link><br/>
      <Link to={"/setup/list"}>Join game</Link><br/>
      <Link to={"/settings"}>Settings</Link>
      <hr/>
      <Link to={"/playDEV"}>Join DEV game</Link><br/>
      <Link to={"/startDEV"}>Start DEV game</Link>
    </div>;
  }
}

export default (props) => <MainContext.Consumer>{context => <Home {...props} context={context}/>}</MainContext.Consumer>;