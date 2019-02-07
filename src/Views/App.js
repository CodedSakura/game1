import React, { Component } from 'react';
import '../Style/App.css';
import {Route, BrowserRouter as Router, Switch, Redirect} from "react-router-dom";
import {TransitionGroup, CSSTransition} from "react-transition-group";
import {Alert, Container} from "reactstrap";

import Home from "./Home";
import NotFound from "./NotFound";
import SetupNew from "./SetupNew";
import SetupJoin from "./SetupJoin";
import Play from "./Play";
import Settings from "./Settings";
import MainContext from "../Contexts/MainContext";
import {withCookies} from "react-cookie";
import PlayDEV from "./DEV/PlayDEV";
import StartDEV from "./DEV/StartDEV";
import SetupList from "./SetupList";

class App extends Component {

  constructor(props) {
    super(props);
    this.cookies = this.props.cookies;
    const theme = this.cookies.get("theme") || "dark";
    this.state = {
      theme: theme,
      newGameData: undefined,
      redirect: undefined
    };
    document.body.className = theme;
    this.toggleTheme = this.toggleTheme.bind(this);
    this.setNewGameData = this.setNewGameData.bind(this);
    this.redirectTo = this.redirectTo.bind(this);
  }

  toggleTheme() {
    this.setState(state => ({theme: state.theme === "dark" ? "light" : "dark"}), () => {
      const exp = new Date();
      exp.setDate(exp.getFullYear() + 3);
      this.cookies.set("theme", this.state.theme, {path: "/", expires: exp});
      document.body.className = this.state.theme;
    });
  }

  setNewGameData(data) {
    this.setState({newGameData: data});
  }

  redirectTo(where, reason, context) {
    this.setState(
      {redirect: where, redirectReason: reason, redirectContext: context, redirectPath: where},
      () => this.setState({redirect: undefined})
    );
  }

  alertDismissed() {
    this.setState({redirectReason: undefined, redirectContext: undefined, redirectPath: undefined})
  }

  render() {
    return (
      <MainContext.Provider value={{
        theme: this.state.theme, toggleTheme: this.toggleTheme,
        data: this.state.newGameData, setData: this.setNewGameData,
        redirectTo: this.redirectTo
      }}>
      <Router basename={process.env.PUBLIC_URL}>
      <Route render={({location}) => (
        <div>
        <TransitionGroup className="fade-obj">
        <CSSTransition key={(() => {console.log(location.key);return location.key})()} classNames="fade" timeout={100}>
          <Container fluid className="main-container">
            {this.state.redirectReason ? <Alert color={this.state.redirectContext} isOpen={this.state.redirectPath === location.pathname} toggle={this.alertDismissed.bind(this)}>{this.state.redirectReason}</Alert> : undefined}
            <Switch location={location}>
              <Route exact path="/" component={Home}/>
              <Route path="/setup/new" component={SetupNew}/>
              <Route path="/setup/list" component={SetupList}/>
              <Route path="/setup/join/:id" component={SetupJoin}/>
              <Route path="/play/:id?" component={Play}/>
              <Route path="/playDEV" component={PlayDEV}/>
              <Route path="/startDEV" component={StartDEV}/>
              <Route path="/settings" component={Settings}/>
              <Route component={NotFound}/>
            </Switch>
          </Container>
        </CSSTransition>
        </TransitionGroup>
        {this.state.redirect ? <Redirect push to={this.state.redirect}/> : undefined}
        </div>
      )}/>
      </Router>
      </MainContext.Provider>
    );
  }
}

export default withCookies(App);
