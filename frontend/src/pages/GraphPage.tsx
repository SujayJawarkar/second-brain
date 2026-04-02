import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Network, Lock, ExternalLink, X } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import AppLayout from "../components/layout/AppLayout";
import { itemsApi } from "../api/items";
import { useAuthStore } from "../store/auth.store";
import type { GraphNode, GraphEdge } from "../types";

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface SimNode extends GraphNode, d3.SimulationNodeDatum {
  x?: number;
  y?: number;
}

function ProGate() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center p-8">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
        <Lock className="w-7 h-7 text-muted-foreground" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground">
          Knowledge Graph is a Pro feature
        </h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          Upgrade to Pro to see how your saved items connect and form knowledge
          clusters.
        </p>
      </div>
      <Button className="bg-brand-600 hover:bg-brand-700 text-white">
        Upgrade to Pro
      </Button>
    </div>
  );
}

function NodeDetail({
  node,
  onClose,
}: {
  node: GraphNode;
  onClose: () => void;
}) {
  return (
    <div className="absolute top-4 right-4 w-72 bg-card border border-border rounded-2xl shadow-lg p-4 z-10">
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-medium text-foreground text-sm leading-snug line-clamp-3">
          {node.title}
        </h3>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground shrink-0 mt-0.5"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {node.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {node.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-[10px] h-4 px-1.5"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-[10px]">
          {node.sourceType}
        </Badge>
        {node.url && (
          <button
            onClick={() => window.open(node.url!, "_blank")}
            className="flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            Open
          </button>
        )}
      </div>
    </div>
  );
}

function GraphCanvas({
  data,
  onNodeClick,
  selectedId,
}: {
  data: GraphData;
  onNodeClick: (node: GraphNode) => void;
  selectedId: string | null;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    svg.selectAll("*").remove();

    // Color scale for source types
    const colorMap: Record<string, string> = {
      url: "#6366f1",
      pdf: "#f59e0b",
      note: "#10b981",
    };

    // Zoom container
    const g = svg.append("g");

    svg.call(
      d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.2, 4])
        .on("zoom", (event) => {
          g.attr("transform", event.transform);
        }),
    );

    // Simulation
    const simNodes: SimNode[] = data.nodes.map((n) => ({ ...n }));
    const nodeMap = new Map(simNodes.map((n) => [n.id, n]));

    const links = data.edges
      .map((e) => ({
        source: nodeMap.get(e.sourceId)!,
        target: nodeMap.get(e.targetId)!,
        similarity: e.similarity,
      }))
      .filter((l) => l.source && l.target);

    const simulation = d3
      .forceSimulation<SimNode>(simNodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance(120)
          .strength(0.3),
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide(40));

    // Draw edges
    const link = g
      .append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#94a3b8")
      .attr("stroke-opacity", (d) => Math.max(0.2, d.similarity))
      .attr("stroke-width", (d) => Math.max(0.5, d.similarity * 2));

    // Draw nodes
    const node = g
      .append("g")
      .selectAll<SVGGElement, SimNode>("g")
      .data(simNodes)
      .join("g")
      .attr("cursor", "pointer")
      .call(
        d3
          .drag<SVGGElement, SimNode>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }),
      )
      .on("click", (_event, d) => onNodeClick(d));

    // Node circles
    node
      .append("circle")
      .attr("r", 20)
      .attr("fill", (d) => colorMap[d.sourceType] || "#6366f1")
      .attr("fill-opacity", 0.15)
      .attr("stroke", (d) => colorMap[d.sourceType] || "#6366f1")
      .attr("stroke-width", (d) => (d.id === selectedId ? 3 : 1.5));

    // Node labels
    node
      .append("text")
      .text((d) => d.title.slice(0, 20) + (d.title.length > 20 ? "…" : ""))
      .attr("text-anchor", "middle")
      .attr("dy", 34)
      .attr("font-size", "10px")
      .attr("fill", "currentColor")
      .attr("class", "text-foreground")
      .style("pointer-events", "none")
      .style("user-select", "none");

    // Tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [data, selectedId]);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full"
      style={{ color: "var(--foreground)" }}
    />
  );
}

export default function GraphPage() {
  const { user } = useAuthStore();
  const [selected, setSelected] = useState<GraphNode | null>(null);

  const { data, isLoading, isError } = useQuery<GraphData>({
    queryKey: ["graph"],
    queryFn: async () => {
      const res = await itemsApi.graph();
      return res.data;
    },
    enabled: user?.plan === "pro",
    staleTime: 1000 * 60 * 5,
  });

  if (user?.plan !== "pro") {
    return (
      <AppLayout>
        <ProGate />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Knowledge Graph
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {data?.nodes.length
                ? `${data.nodes.length} items · ${data.edges.length} connections`
                : "Visualising your connected knowledge"}
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-500 inline-block" />
              URL
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              PDF
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Note
            </span>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden bg-muted/30">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
                <p className="text-sm text-muted-foreground">
                  Building your knowledge graph...
                </p>
              </div>
            </div>
          )}

          {isError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Failed to load graph. Try refreshing.
              </p>
            </div>
          )}

          {data && data.nodes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-8">
              <Network className="w-12 h-12 text-muted-foreground/40" />
              <div>
                <p className="font-medium text-foreground text-sm">
                  No connections yet
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Save more items on related topics and connections will appear
                  automatically.
                </p>
              </div>
            </div>
          )}

          {data && data.nodes.length > 0 && (
            <GraphCanvas
              data={data}
              onNodeClick={setSelected}
              selectedId={selected?.id || null}
            />
          )}

          {/* Node detail panel */}
          {selected && (
            <NodeDetail node={selected} onClose={() => setSelected(null)} />
          )}

          {/* Zoom hint */}
          {data && data.nodes.length > 0 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <p className="text-xs text-muted-foreground bg-card border border-border px-3 py-1.5 rounded-full shadow-sm">
                Scroll to zoom · Drag to pan · Click node for details
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
