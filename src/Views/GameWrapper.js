import React, {Component} from "react";
import "../Style/Game.css";
import Game, {PROPS} from "./Game";

class GameWrapper extends Component {
  constructor(props) {
    super(props);
    this.svg = React.createRef();
    this.state = {scale: 1};
    this.activeKeys = new Set();
    this.moveList = {};
    this.actionList = {};
    this.eventCatch = () => {};
    this.reset = this.reset.bind(this);
    this.keyListener = this.keyListener.bind(this);
    this.keyListener = this.keyListener.bind(this);
    this.resizeListener = this.resizeListener.bind(this);
  }

  componentDidMount() {
    this.props.initListener(this.initListener.bind(this));
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.keyListener);
    document.removeEventListener("keyup", this.keyListener);
    window.removeEventListener("resize", this.resizeListener);
  }

  initListener() {
    this.props.bindListener(this.eventListener.bind(this));
    document.addEventListener("keydown", this.keyListener);
    document.addEventListener("keyup", this.keyListener);
    window.addEventListener("resize", this.resizeListener);
    this.reset(this.props.me);
    this.setState({scale: (this.svg.current.getBoundingClientRect().width - 30) / PROPS.size});
    setInterval(this.moveWrapper.bind(this), PROPS.moveDelay);
    setInterval(() => this.props.wsSend("u", {[this.props.me]: this.props.data[this.props.me]}), 100);
  }

  resizeListener() {
    this.setState({scale: (this.svg.current.getBoundingClientRect().width - 30) / PROPS.size}, () => console.log(this.svg.current.getBoundingClientRect().width - 30, PROPS.size));
  }

  reset(user) {
    this.props.wsSend("u", {[user]: PROPS.defaultValue()});
  }

  moveWrapper() {
    let hasRun = false;
    const d1 = this.props.data;
    const data = d1[this.props.me];
    for (const key of this.activeKeys) {
      const move = this.moveList[key];
      hasRun = (move && (!!move(data) || true)) || hasRun;
    }
    if (hasRun) this.props.updateData(d1);
  }

  keyListener(e) {
    if (e.type === "keyup") {
      this.activeKeys.delete(e.code);
    } else if (e.type === "keydown") {
      if (e.code === "Space") e.preventDefault();
      if (!this.activeKeys.has(e.code) && this.actionList[e.code]) {
        const d1 = this.props.data;
        const data = d1[this.props.me];
        this.actionList[e.code](data, this.props.me);
        this.props.updateData(d1);
      }
      this.activeKeys.add(e.code);
    }
  }

  eventListener(m) {
    this.eventCatch(JSON.parse(m.substring(m.split(":")[0].length+1)));
  }

  render() {
    return <svg width={PROPS.size} height={PROPS.size} className="col-md-auto" ref={this.svg}>
      <rect width="100%" height="100%" className={`bg ${this.props.loading ? "loading" : ""}`}/>
      {this.props.loading ? undefined :
        <Game scale={this.state.scale} data={this.props.data} me={this.props.me} host={this.props.host}
              setMoveList={f => this.moveList = f} setActionList={f => this.actionList = f} setEventCatch={f => this.eventCatch = f}
              wsSend={this.props.wsSend}/>
      }
    </svg>
  }
}

export default GameWrapper;