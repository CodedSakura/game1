import React, {Component} from "react";
import MainContext from "../../Contexts/MainContext";

class StartDev extends Component {
  devPlay() {
    this.props.context.setData({name:"Yeet",maxPlayers:4,"private":false,password:"",username:"ThePhisics101"});
    this.props.context.redirectTo("/play");
    return <div/>;
  }

  componentDidMount() {
    this.devPlay.bind(this)();
  }

  render() {
    return <div/>;
  }
}

export default (props) => <MainContext.Consumer>{context => <StartDev {...props} context={context}/>}</MainContext.Consumer>;