import React, {Component} from "react";
import MainContext from "../../Contexts/MainContext";

class PlayDev extends Component {
  devPlay() {
    this.props.context.setData({username: "ThePhisics102"});
    this.props.context.redirectTo("/play/123");
    return <div/>;
  }

  componentDidMount() {
    this.devPlay.bind(this)();
  }

  render() {
    return <div/>;
  }
}

export default (props) => <MainContext.Consumer>{context => <PlayDev {...props} context={context}/>}</MainContext.Consumer>;