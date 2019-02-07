import React, {Component} from "react";
const rad = (deg) => deg * Math.PI / 180;
const lim = (val) => Math.max(20, Math.min(val, 580));
const move = (d, v, strafe) => {
  d.x = lim(d.x + Math.cos(rad(d.a - (strafe ? 90 : 0))) * v);
  d.y = lim(d.y + Math.sin(rad(d.a - (strafe ? 90 : 0))) * v);
};
const offset = (u, v) => ({x: u.x + Math.cos(rad(u.a)) * v, y: u.y + Math.sin(rad(u.a)) * v});
// const distSq = (a, b) => (a.x-b.x)**2 + (a.y-b.y)**2;

class Game extends Component {
  constructor(props) {
    super(props);
    this.state = {shots: [], lastShot: 0};
  }

  componentDidMount() {
    this.props.setMoveList({
      "KeyQ": d => move(d, 0.3, true ), "KeyE": d => move(d, -0.3, true ),
      "KeyW": d => move(d, 1  , false), "KeyS": d => move(d, -0.7  , false),
      "KeyA": d => d.a--, "KeyD": d => d.a++
    });
    this.props.setActionList({
      "Space": (_, m) => {
        if (this.state.lastShot + 500 > new Date().getTime()) return;
        this.setState({lastShot: new Date().getTime()});
        this.props.wsSend("e", m)
      }
    });
    this.props.setEventCatch(m => {
      const shots = this.state.shots.filter(v => v[1] >= new Date().getTime() - 1000);
      shots.push([m, new Date().getTime(), Object.assign({}, this.props.data[m])]);
      this.setState({shots: shots});
    })
  }

  render() {
    const s = this.props.scale;
    return <g transform={`scale(${s})`}>
      {this.state.shots.map(v => {
        const t = new Date().getTime() - v[1];
        if (t > 1000) return undefined;
        const u = v[2], r = Math.cbrt(1000 - t) * s;
        const q1 = offset(u, 20*s), q2 = offset(u, 850*s);
        return <line strokeWidth={r} x1={q1.x} y1={q1.y} x2={q2.x} y2={q2.y} key={v} stroke={`rgba(0,0,0,${r/10})`}/>;
      })}
      {Object.keys(this.props.data).map(p => {
        const u = this.props.data[p], ps = p === this.props.me && p === this.props.host ? 3 : p === this.props.me ? 1 : p === this.props.host ? 2 : 0;
        if (!u.x) return undefined;
        const pc = ["white", "greenYellow", "aquamarine", "gold"][ps];
        return <g strokeWidth={3} stroke={"black"} fill={"none"} key={p} className={ps % 2 === 1 ? "me" : undefined}>
          <circle r={20} cx={u.x} cy={u.y} strokeWidth={0.25} fill="none" stroke="rgba(0,0,0,0.5)"/>
          <path d={`M0 0 L40 20 L0 40`} fill="none" transform={`translate(${u.x - 20}, ${u.y - 20}) rotate(${u.a}, ${20}, ${20})`}/>
          <text textAnchor="middle" x="0" y="0" transform={`translate(${u.x}, ${Math.max(16, u.y-25)})`} stroke="none" fill={pc}>{p}</text>
          <text textAnchor="middle" x="0" y="0" transform={`translate(${u.x}, ${u.y+6})`} stroke="none" fill="black">{u.score}</text>
        </g>;
      })}
    </g>;
  }
}

export default Game;
export const PROPS = {
  size: 600,
  defaultValue: () => ({
    x: Math.floor(Math.random() * 560) + 20,
    y: Math.floor(Math.random() * 560) + 20,
    a: Math.random() * 360,
    score: 0
  }),
  moveDelay: 25
};