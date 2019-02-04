const rad = (deg) => deg * Math.PI / 180;
const offset = (u, v) => ({x: u.x + Math.cos(rad(u.a)) * v, y: u.y + Math.sin(rad(u.a)) * v});
const distSq = (a, b) => (a.x-b.x)**2 + (a.y-b.y)**2;

module.exports = (d, m) => {
  m = JSON.parse(m.substring(3+m.split(":")[1].length));
  if (!d[m]) return false;
  const o = d[m];
  const l1 = offset(o, 20), l2 = offset(o, 850), l0 = offset(o, -20);
  let b = false;
  for (const n in d) {
    if (!d.hasOwnProperty(n) || n === m) continue;
    const c = d[n];
    const hit = distSq(l1, c) < distSq(l0, c) &&
      Math.abs(((c.x - l1.x) * (l2.y - l1.y) - (c.y - l1.y) * (l2.x - l1.x)) / Math.sqrt(distSq(l1, l2))) <= 20;
    if (hit) {
      d[n] = {score: d[n].score};
      d[m].score++;
      b = true;
    }
  }
  return b;
};