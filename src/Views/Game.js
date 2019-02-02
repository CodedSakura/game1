import React, {Component} from "react";
const rad = (deg) => deg * Math.PI / 180;
const lim = (val) => Math.max(20, Math.min(val, 580));
const move = (d, v, strafe) => {
  d.x = lim(d.x + Math.cos(rad(d.a - (strafe ? 90 : 0))) * v);
  d.y = lim(d.y + Math.sin(rad(d.a - (strafe ? 90 : 0))) * v);
};
const offset = (u, v) => ({x: u.x + Math.cos(rad(u.a)) * v, y: u.y + Math.sin(rad(u.a)) * v});

class Game extends Component {
  constructor(props) {
    super(props);
    this.state = {shots: [], lastShot: 0};
  }

  componentDidMount() {
    this.props.setMoveList({
      "q": d => move(d, 0.3, true ), "e": d => move(d, -0.3, true ),
      "w": d => move(d, 1  , false), "s": d => move(d, -0.7  , false),
      "a": d => d.a--, "d": d => d.a++
    });
    this.props.setActionList({
      " ": (_, m) => {
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
        return <g strokeWidth={3} stroke={"black"} fill={"none"} key={p}>
          <circle r={20} cx={u.x} cy={u.y} strokeWidth={0.25} fill="none" stroke="rgba(0,0,0,0.5)"/>
          <path d={`M0 0 L40 20 L0 40`} fill="none" transform={`translate(${u.x - 20}, ${u.y - 20}) rotate(${u.a}, ${20}, ${20})`}/>
          <text textAnchor="middle" x={u.x} y={Math.max(16, u.y-25)} stroke="none" fill={pc}>{p}</text>
          <text textAnchor="middle" x={u.x} y={u.y+6} stroke="none" fill="black">{u.score}</text>
          {ps % 2 === 1 ? (() => {
            const q = offset(u, 850);
            const algo = (c) => {
              const o = u, l1 = o, l2 = q;
              return Math.abs(((c.x - l1.x) * (l2.y - l1.y) - (c.y - l1.y) * (l2.x - l1.x)) / Math.sqrt((l1.x - l2.x) ** 2 + (l1.y - l2.y) ** 2)) <= 20;
              // return Math.abs((-Math.tan(rad(o.a*(c.x+o.x)))+c.y+o.y)*Math.cos(rad(o.a)))/ <= 20;
              // return (c.x*(l2.x - l1.x) + c.y*(l1.y - l2.y) + l1.y*(l1.x-l2.x) + l1.x*(l2.y-l1.y)) /
              // Math.sqrt((l1.x - l2.x) ** 2 + (l1.y - l2.y) ** 2) <= 20;
            };
            const f = () => {
              for (const n in this.props.data) {
                if (!this.props.data.hasOwnProperty(n) || n === this.props.me) continue;
                if (algo(this.props.data[n])) return true;
              }
              return false;
            };
            // for (let i = 0; i < 16; i++) {let a = i; console.log([a>(a=a%8), a>(a=a%4), a>(a=a%2), a>(a=a%1)]);}
            // let a = (u.a % 360)+360;
            // const whichQ = [90<=a,90<=(a-90),90<=(a-180),90<=(a-270)];
            // const quadrants = [];
            // const quads = [[0, 0, u.x+20, u.y+20], [u.x-20, 0, 600, u.y+20], [0, u.y-20, u.x+20, 600], [u.x-20, u.y-20, 600, 600]];
            // for (const k in quads) {
            //   const i = quads[k];
            //   quadrants.push(<rect key={i} x={i[0]} y={i[1]} width={i[2] - i[0]} height={i[3] - i[1]}
            //                        fill={`rgba(${whichQ[i]?0:255},0,0,0.1)`} stroke="none"/>);
            // }
            return <g>
              <line strokeWidth={1} x1={u.x} y1={u.y} x2={q.x} y2={q.y} stroke={f() ? "blue" : "red"}/>
              {/*{quadrants}*/}
            </g>
          })() : undefined}
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