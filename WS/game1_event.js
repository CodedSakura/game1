const rad = (deg) => deg * Math.PI / 180;
const offset = (u, v) => ({x: u.x + Math.cos(rad(u.a)) * v, y: u.y + Math.sin(rad(u.a)) * v});
module.exports = (d, m) => {
  m = JSON.parse(m.substring(3+m.split(":")[1].length));
  if (!d[m]) return false;
  const o = d[m];
  const l1 = offset(o, 20), l2 = offset(o, 850);
  for (const n in d) {
    if (!d.hasOwnProperty(n) || n === m) continue;
    const c = d[n];
    console.log(n, c.x, c.y, c.a);
    // let hit = ((c.x - l1.x) * (l2.y - l1.y) - (c.y - l1.y) * (l2.x - l1.x)) / Math.sqrt((l1.x - l2.x) ** 2 + (l1.y - l2.y) ** 2) <= 20;
    let hit = (c.x*(l2.x - l1.x) + c.y*(l1.y - l2.y) + l1.y*(l1.x-l2.x) + l1.x*(l2.y-l1.y)) / Math.sqrt((l1.x - l2.x) ** 2 + (l1.y - l2.y) ** 2) <= 20;
    console.log(hit);
  }
  return false;
};