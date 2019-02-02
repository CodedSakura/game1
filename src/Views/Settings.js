import React, {Component} from "react";
import {Link} from "react-router-dom";
import {Button} from "reactstrap";
import MainContext from "../Contexts/MainContext";

class Settings extends Component {
  componentDidMount() {
    document.title = "Settings";
  }

  render() {
    return <div>
      <h2>Settings <small><Link to={"/"}>Back</Link></small></h2>
      <Button onClick={this.props.context.toggleTheme}>Change theme</Button>
    </div>;
  }
}

export default (props) => <MainContext.Consumer>{context => <Settings {...props} context={context}/>}</MainContext.Consumer>;