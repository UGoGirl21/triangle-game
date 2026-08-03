export const edgeKey = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);
export const triKey = (a, b, c) => [a, b, c].sort((x, y) => x - y).join("-");

export function orient(p, q, r) {
  const value = (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
  return Math.abs(value) < 1e-7 ? 0 : value > 0 ? 1 : -1;
}

function onSegment(p, q, r) {
  return Math.min(p.x, r.x) - 1e-6 <= q.x && q.x <= Math.max(p.x, r.x) + 1e-6 &&
    Math.min(p.y, r.y) - 1e-6 <= q.y && q.y <= Math.max(p.y, r.y) + 1e-6;
}

export function segmentsIntersect(p1, p2, p3, p4) {
  const o1 = orient(p1, p2, p3);
  const o2 = orient(p1, p2, p4);
  const o3 = orient(p3, p4, p1);
  const o4 = orient(p3, p4, p2);
  if (o1 !== o2 && o3 !== o4) return true;
  return (o1 === 0 && onSegment(p1, p3, p2)) || (o2 === 0 && onSegment(p1, p4, p2)) ||
    (o3 === 0 && onSegment(p3, p1, p4)) || (o4 === 0 && onSegment(p3, p2, p4));
}

export function pointInTriangle(point, a, b, c) {
  const directions = [orient(point, a, b), orient(point, b, c), orient(point, c, a)];
  return !(directions.some((value) => value < 0) && directions.some((value) => value > 0));
}

export function distanceToSegment(point, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) return Math.hypot(point.x - a.x, point.y - a.y);
  const projection = Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSquared));
  const closestX = a.x + projection * dx;
  const closestY = a.y + projection * dy;
  return Math.hypot(point.x - closestX, point.y - closestY);
}
