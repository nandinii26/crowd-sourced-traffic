// Simple Dijkstra implementation for route cost given graph adjacency
type Edge = { to: string; weight: number };

export function dijkstra(graph: Record<string, Edge[]>, source: string) {
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const Q = new Set(Object.keys(graph));

  for (const v of Q) {
    dist[v] = Infinity;
    prev[v] = null;
  }
  dist[source] = 0;

  while (Q.size) {
    let u: string | null = null;
    let min = Infinity;
    for (const v of Q) {
      if (dist[v] < min) {
        min = dist[v];
        u = v;
      }
    }
    if (!u) break;
    Q.delete(u);
    for (const edge of graph[u] || []) {
      const alt = dist[u] + edge.weight;
      if (alt < dist[edge.to]) {
        dist[edge.to] = alt;
        prev[edge.to] = u;
      }
    }
  }
  return { dist, prev };
}
