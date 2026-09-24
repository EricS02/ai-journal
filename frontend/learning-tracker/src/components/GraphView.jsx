import { useEffect, useRef, useState } from 'react';
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force';

const WIDTH = 900;
const HEIGHT = 620;
const CLICK_THRESHOLD = 4; // px of movement below which a pointer-up counts as a click, not a drag

/** A concept map built live from `related` edges — draggable, zoomable, click for details. */
export default function GraphView({ concepts }) {
  const svgRef = useRef(null);
  const simulationRef = useRef(null);
  const nodesRef = useRef([]);
  const linksRef = useRef([]);
  const dragRef = useRef(null); // { node, moved }
  const panRef = useRef(null); // { startX, startY, originX, originY, moved }

  const [, setTick] = useState(0); // bump to force a re-render off the mutable nodesRef/linksRef
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const knownNames = new Set(concepts.map((c) => c.name));
    const simNodes = concepts.map((c) => ({ id: c.name, mentionCount: c.mention_count || 1 }));
    const simLinks = [];
    concepts.forEach((c) => {
      (c.related || []).forEach((r) => {
        if (knownNames.has(r)) simLinks.push({ source: c.name, target: r });
      });
    });

    const simulation = forceSimulation(simNodes)
      .force('link', forceLink(simLinks).id((d) => d.id).distance(90))
      .force('charge', forceManyBody().strength(-220))
      .force('center', forceCenter(WIDTH / 2, HEIGHT / 2))
      .force('collide', forceCollide(36))
      .on('tick', () => setTick((t) => t + 1));

    simulationRef.current = simulation;
    nodesRef.current = simNodes;
    linksRef.current = simLinks;
    setSelectedId(null);

    return () => simulation.stop();
  }, [concepts]);

  const screenToWorld = (clientX, clientY) => {
    const rect = svgRef.current.getBoundingClientRect();
    const sx = ((clientX - rect.left) / rect.width) * WIDTH;
    const sy = ((clientY - rect.top) / rect.height) * HEIGHT;
    return { x: (sx - transform.x) / transform.k, y: (sy - transform.y) / transform.k };
  };

  const onNodePointerDown = (node) => (e) => {
    e.stopPropagation();
    dragRef.current = { node, moved: false, startX: e.clientX, startY: e.clientY };
    simulationRef.current.alphaTarget(0.3).restart();
  };

  const onSvgPointerMove = (e) => {
    if (dragRef.current) {
      const { node, startX, startY } = dragRef.current;
      if (Math.abs(e.clientX - startX) + Math.abs(e.clientY - startY) > CLICK_THRESHOLD) {
        dragRef.current.moved = true;
      }
      const { x, y } = screenToWorld(e.clientX, e.clientY);
      node.fx = x;
      node.fy = y;
      return;
    }
    if (panRef.current) {
      const { startX, startY, originX, originY } = panRef.current;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) + Math.abs(dy) > CLICK_THRESHOLD) panRef.current.moved = true;
      setTransform((t) => ({ ...t, x: originX + dx, y: originY + dy }));
    }
  };

  const onSvgPointerUp = () => {
    if (dragRef.current) {
      const { node, moved } = dragRef.current;
      if (!moved) setSelectedId((cur) => (cur === node.id ? null : node.id));
      simulationRef.current.alphaTarget(0);
      dragRef.current = null;
    }
    panRef.current = null;
  };

  const onSvgPointerDownBackground = (e) => {
    panRef.current = { startX: e.clientX, startY: e.clientY, originX: transform.x, originY: transform.y, moved: false };
  };

  const onWheel = (e) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform((t) => ({ ...t, k: Math.min(3, Math.max(0.3, t.k * factor)) }));
  };

  const nodes = nodesRef.current;
  const links = linksRef.current;
  const selectedConcept = concepts.find((c) => c.name === selectedId);
  const neighborIds = new Set();
  if (selectedId) {
    links.forEach((l) => {
      if (l.source.id === selectedId) neighborIds.add(l.target.id);
      if (l.target.id === selectedId) neighborIds.add(l.source.id);
    });
  }

  return (
    <div className="flex w-full max-w-[1100px] gap-5">
      <div className="flex-1 rounded-lg bg-surface p-6 shadow-sm">
        <h1 className="mb-4 text-[20px] font-medium tracking-[-0.01em]">Learning map</h1>
        {concepts.length === 0 ? (
          <div className="px-1 py-[18px] text-[13px] text-neutral-400">No concepts yet — log an entry to start building the map.</div>
        ) : (
          <svg
            ref={svgRef}
            width={WIDTH}
            height={HEIGHT}
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="w-full cursor-grab rounded-md bg-ground active:cursor-grabbing"
            onPointerDown={onSvgPointerDownBackground}
            onPointerMove={onSvgPointerMove}
            onPointerUp={onSvgPointerUp}
            onPointerLeave={onSvgPointerUp}
            onWheel={onWheel}
          >
            <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
              {links.map((l, i) => {
                const dimmed = selectedId && l.source.id !== selectedId && l.target.id !== selectedId;
                return (
                  <line
                    key={i}
                    x1={l.source.x}
                    y1={l.source.y}
                    x2={l.target.x}
                    y2={l.target.y}
                    className={dimmed ? 'stroke-neutral-800' : 'stroke-neutral-600'}
                    strokeWidth={1}
                  />
                );
              })}
              {nodes.map((n) => {
                const isSelected = n.id === selectedId;
                const isNeighbor = neighborIds.has(n.id);
                const dimmed = selectedId && !isSelected && !isNeighbor;
                const r = 8 + Math.min(n.mentionCount, 10) * 2;
                return (
                  <g key={n.id} onPointerDown={onNodePointerDown(n)} className="cursor-pointer">
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={r}
                      className={
                        isSelected ? 'fill-accent-300' : dimmed ? 'fill-accent-900' : 'fill-accent-600'
                      }
                    />
                    <text
                      x={n.x}
                      y={n.y - (r + 4)}
                      textAnchor="middle"
                      fontSize={11}
                      className={dimmed ? 'fill-neutral-600' : 'fill-neutral-200'}
                    >
                      {n.id}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        )}
        <p className="mt-3 text-[11px] text-neutral-500">Drag a node to move it · click a node for details · scroll to zoom · drag the background to pan</p>
      </div>

      {selectedConcept && (
        <div className="w-[260px] flex-none rounded-lg bg-surface p-5 shadow-sm">
          <div className="mb-3 flex items-start justify-between gap-2">
            <h2 className="text-[15px] font-medium leading-snug">{selectedConcept.name}</h2>
            <button onClick={() => setSelectedId(null)} className="text-[12px] text-neutral-400 hover:text-ink">✕</button>
          </div>
          {selectedConcept.summary && (
            <p className="mb-3 text-[12.5px] leading-relaxed text-neutral-300">{selectedConcept.summary}</p>
          )}
          <div className="flex flex-col gap-1 text-[11.5px] text-neutral-400">
            <span>First seen: {selectedConcept.first_seen}</span>
            <span>Mentions: {selectedConcept.mention_count}</span>
          </div>
          {selectedConcept.related && selectedConcept.related.length > 0 && (
            <div className="mt-3">
              <div className="mb-1 text-[10px] uppercase tracking-[0.1em] text-neutral-500">Related</div>
              <div className="flex flex-col gap-1">
                {selectedConcept.related.map((r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedId(r)}
                    className="text-left text-[12.5px] text-accent-300 hover:text-accent-200"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
