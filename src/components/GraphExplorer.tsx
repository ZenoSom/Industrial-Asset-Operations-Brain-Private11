import React, { useState, useEffect, useRef } from "react";
import { GraphNode, GraphLink, GraphData } from "../types";
import { 
  FileText, User, Shield, Zap, Search, Info, RefreshCw, Layers, 
  ZoomIn, ZoomOut, Maximize2, Plus, Trash2, Tag, CheckCircle2, 
  AlertTriangle, Settings, PlusCircle, Globe, Award, Database, HelpCircle,
  Droplet, Gauge
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import * as d3 from "d3";

interface GraphExplorerProps {
  documents: any[]; // trigger re-render on active document changes
}

interface D3Node extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: "document" | "equipment" | "personnel" | "regulatory";
  subtitle: string;
  properties?: Record<string, string>;
}

interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  source: string | D3Node;
  target: string | D3Node;
  relationship: string;
}

export default function GraphExplorer({ documents }: GraphExplorerProps) {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<D3Node | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");

  // Zoom & Pan Workspace state
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Custom live property tagging state (persisted locally)
  const [customProperties, setCustomProperties] = useState<Record<string, Record<string, string>>>(() => {
    try {
      const saved = localStorage.getItem("graph_custom_properties");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [newPropKey, setNewPropKey] = useState("");
  const [newPropValue, setNewPropValue] = useState("");
  const [propSuccess, setPropSuccess] = useState(false);

  // Simulation D3 state
  const [simulationNodes, setSimulationNodes] = useState<D3Node[]>([]);
  const [simulationLinks, setSimulationLinks] = useState<D3Link[]>([]);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const simulationRef = useRef<d3.Simulation<D3Node, D3Link> | null>(null);

  const width = 600;
  const height = 450;

  // Fetch base graph data
  const fetchGraphData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/graph");
      if (res.ok) {
        const data = await res.json();
        setGraphData(data);
      }
    } catch (err) {
      console.error("Failed to load knowledge graph: ", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraphData();
  }, [documents]);

  // Build and manage D3 force simulation
  useEffect(() => {
    if (!graphData.nodes || graphData.nodes.length === 0) {
      setSimulationNodes([]);
      setSimulationLinks([]);
      return;
    }

    // Filter nodes based on active node filter
    const filteredNodes: D3Node[] = graphData.nodes
      .filter(n => activeFilter === "all" || n.type === activeFilter)
      .map(n => ({ ...n })); // Shallow copy so D3 can write mutable positioning

    const nodeIds = new Set(filteredNodes.map(n => n.id));

    // Filter links to only connect visible nodes
    const filteredLinks: D3Link[] = graphData.links
      .filter(l => nodeIds.has(l.source) && nodeIds.has(l.target))
      .map(l => ({ ...l }));

    // Stop previous simulation
    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    // Configure new high-fidelity force simulation
    const simulation = d3.forceSimulation<D3Node>(filteredNodes)
      .force("link", d3.forceLink<D3Node, D3Link>(filteredLinks)
        .id(d => d.id)
        .distance(120)
      )
      .force("charge", d3.forceManyBody().strength(-350))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(45))
      .alphaDecay(0.035);

    simulationRef.current = simulation;

    // Tick listener
    simulation.on("tick", () => {
      setSimulationNodes([...filteredNodes]);
      setSimulationLinks([...filteredLinks]);
    });

    // Settle quickly initially
    simulation.alpha(1).restart();

    return () => {
      simulation.stop();
    };
  }, [graphData, activeFilter]);

  // Coordinate transformations to map screen-space mouse to transformed SVG-space coordinates
  const getTransformedCoords = (clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const relativeY = clientY - rect.top;
    
    // Normalize to standard viewBox coordinates
    const viewBoxX = (relativeX / rect.width) * width;
    const viewBoxY = (relativeY / rect.height) * height;
    
    // De-transform Pan & Zoom to find true coordinates in group space
    const x = (viewBoxX - pan.x) / zoom;
    const y = (viewBoxY - pan.y) / zoom;
    return { x, y };
  };

  // Node Drag & Drop Handlers
  const handleNodePointerDown = (e: React.PointerEvent, node: D3Node) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    setDraggedNodeId(node.id);
    
    const coords = getTransformedCoords(e.clientX, e.clientY);
    node.fx = coords.x;
    node.fy = coords.y;

    if (simulationRef.current) {
      simulationRef.current.alphaTarget(0.2).restart();
    }
  };

  const handleNodePointerMove = (e: React.PointerEvent) => {
    if (!draggedNodeId) return;
    const node = simulationNodes.find(n => n.id === draggedNodeId);
    if (node) {
      const coords = getTransformedCoords(e.clientX, e.clientY);
      node.fx = coords.x;
      node.fy = coords.y;
    }
  };

  const handleNodePointerUp = (e: React.PointerEvent) => {
    if (!draggedNodeId) return;
    (e.target as Element).releasePointerCapture(e.pointerId);

    const node = simulationNodes.find(n => n.id === draggedNodeId);
    if (node) {
      node.fx = undefined; // unfix coordinates
      node.fy = undefined;
    }

    setDraggedNodeId(null);
    if (simulationRef.current) {
      simulationRef.current.alphaTarget(0); // settle simulation
    }
  };

  // Panning SVG Workspace
  const handleBgPointerDown = (e: React.PointerEvent) => {
    if (draggedNodeId) return;
    // Only pan if clicking on background or grid elements
    const targetId = (e.target as Element).id;
    if (e.target === svgRef.current || targetId === "bg-grid" || targetId === "bg-overlay") {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleBgPointerMove = (e: React.PointerEvent) => {
    if (draggedNodeId) {
      handleNodePointerMove(e);
      return;
    }
    if (!isPanning) return;
    setPan({
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y
    });
  };

  const handleBgPointerUp = (e: React.PointerEvent) => {
    if (draggedNodeId) {
      handleNodePointerUp(e);
      return;
    }
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const zoomFactor = 1.08;
    let nextZoom = zoom;
    if (e.deltaY < 0) {
      nextZoom = Math.min(zoom * zoomFactor, 4); // Max Zoom 4x
    } else {
      nextZoom = Math.max(zoom / zoomFactor, 0.4); // Min Zoom 0.4x
    }
    setZoom(nextZoom);
  };

  // Zoom Helpers
  const triggerZoom = (direction: "in" | "out") => {
    if (direction === "in") {
      setZoom(prev => Math.min(prev * 1.2, 4));
    } else {
      setZoom(prev => Math.max(prev / 1.2, 0.4));
    }
  };

  const resetViewport = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    if (simulationRef.current) {
      simulationRef.current.alpha(0.8).restart();
    }
  };

  // Live custom property adder
  const handleAddProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNode || !newPropKey.trim() || !newPropValue.trim()) return;

    const key = newPropKey.trim();
    const val = newPropValue.trim();

    setCustomProperties(prev => {
      const updated = {
        ...prev,
        [selectedNode.id]: {
          ...(prev[selectedNode.id] || {}),
          [key]: val
        }
      };
      localStorage.setItem("graph_custom_properties", JSON.stringify(updated));
      return updated;
    });

    setNewPropKey("");
    setNewPropValue("");
    setPropSuccess(true);
    setTimeout(() => setPropSuccess(false), 2000);
  };

  // Live custom property remover
  const handleRemoveCustomProperty = (keyToRemove: string) => {
    if (!selectedNode) return;
    setCustomProperties(prev => {
      const nodeProps = { ...(prev[selectedNode.id] || {}) };
      delete nodeProps[keyToRemove];
      
      const updated = {
        ...prev,
        [selectedNode.id]: nodeProps
      };
      localStorage.setItem("graph_custom_properties", JSON.stringify(updated));
      return updated;
    });
  };

  const renderPropertyItem = (key: string, value: any, isUserCustom: boolean) => {
    const valueStr = String(value);
    const keyLower = key.toLowerCase();
    const valueLower = valueStr.toLowerCase();
    
    // Determine dynamic styling & icons
    let icon = <Database className="h-3.5 w-3.5 text-slate-500" />;
    let valColor = "text-slate-100";
    let bgStyle = "bg-slate-950/60 border-slate-900";
    
    // Check alarm status
    const isAlarm = valueLower.includes("warning") || valueLower.includes("spike") || valueLower.includes("breach") || valueLower.includes("excursion") || valueLower.includes("critical") || valueLower.includes("anomaly");
    
    if (isAlarm) {
      icon = <AlertTriangle className="h-3.5 w-3.5 text-red-400 animate-pulse" />;
      valColor = "text-red-400 font-bold";
      bgStyle = "bg-red-500/10 border-red-500/30 shadow-sm shadow-red-500/5";
    } else if (keyLower.includes("temp") || keyLower.includes("trip")) {
      icon = <Zap className="h-3.5 w-3.5 text-orange-400" />;
      valColor = "text-orange-300";
    } else if (keyLower.includes("speed") || keyLower.includes("rate") || keyLower.includes("power") || keyLower.includes("flow") || keyLower.includes("rpm")) {
      icon = <Gauge className="h-3.5 w-3.5 text-amber-400" />;
      valColor = "text-amber-300";
    } else if (keyLower.includes("fluid") || keyLower.includes("media") || keyLower.includes("lube") || keyLower.includes("oil")) {
      icon = <Droplet className="h-3.5 w-3.5 text-sky-400" />;
      valColor = "text-sky-300";
    } else if (keyLower.includes("name") || keyLower.includes("person") || keyLower.includes("staff") || keyLower.includes("title") || keyLower.includes("rep") || keyLower.includes("operator") || keyLower.includes("supervisor") || keyLower.includes("credentials")) {
      icon = <User className="h-3.5 w-3.5 text-purple-400" />;
      valColor = "text-purple-300";
    } else if (keyLower.includes("standard") || keyLower.includes("code") || keyLower.includes("law") || keyLower.includes("rule") || keyLower.includes("section") || keyLower.includes("regulatory") || keyLower.includes("compliance") || keyLower.includes("mandate")) {
      icon = <Shield className="h-3.5 w-3.5 text-blue-400" />;
      valColor = "text-blue-300";
    } else if (keyLower.includes("file") || keyLower.includes("doc") || keyLower.includes("upload") || keyLower.includes("size")) {
      icon = <FileText className="h-3.5 w-3.5 text-teal-400" />;
      valColor = "text-teal-300";
    } else if (keyLower.includes("status") || keyLower.includes("isolation")) {
      icon = <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />;
      valColor = "text-emerald-300";
    } else if (keyLower.includes("tag") || keyLower.includes("id")) {
      icon = <Tag className="h-3.5 w-3.5 text-yellow-400" />;
      valColor = "text-yellow-300";
    }

    return (
      <div 
        key={key} 
        className={`flex items-start gap-3 p-2.5 rounded border transition-all ${bgStyle}`}
      >
        <div className="mt-1 flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-500 text-[8px] uppercase tracking-widest block font-sans font-bold">
              {key}
            </span>
            {isUserCustom && (
              <button 
                type="button"
                onClick={() => handleRemoveCustomProperty(key)}
                className="text-red-500 hover:text-red-400 font-mono font-bold text-[8px] uppercase tracking-tighter"
                title="Delete custom metadata tag"
              >
                [ REMOVE ]
              </button>
            )}
          </div>
          <span className={`block mt-1 text-[11px] leading-relaxed break-words font-mono ${valColor}`}>
            {valueStr}
          </span>
        </div>
      </div>
    );
  };

  // Dynamic Neighbor Mapping (Handles strings & object references from D3)
  const getLinkedNodeIds = (nodeId: string | null) => {
    if (!nodeId) return new Set<string>();
    const neighbors = new Set<string>();
    neighbors.add(nodeId);
    graphData.links.forEach(l => {
      const sourceId = typeof l.source === "object" ? (l.source as any).id : l.source;
      const targetId = typeof l.target === "object" ? (l.target as any).id : l.target;
      if (sourceId === nodeId) neighbors.add(targetId);
      if (targetId === nodeId) neighbors.add(sourceId);
    });
    return neighbors;
  };

  const activeNeighbors = getLinkedNodeIds(hoveredNodeId || selectedNode?.id || null);

  // Search filter
  const searchedNodes = simulationNodes.filter(n => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const matchLabel = n.label.toLowerCase().includes(query);
    const matchSub = n.subtitle.toLowerCase().includes(query);
    // Include match in properties keys or values
    const matchProps = Object.entries({
      ...(n.properties || {}),
      ...(customProperties[n.id] || {})
    }).some(([k, v]) => k.toLowerCase().includes(query) || String(v).toLowerCase().includes(query));

    return matchLabel || matchSub || matchProps;
  });

  // Render SVG Paths for distinct shapes and custom inline icons
  const renderNodeShape = (type: string, size: number, colorClass: string, iconBg: string, isHoveredOrSelected: boolean) => {
    const strokeWidth = isHoveredOrSelected ? 2 : 1.2;
    const strokeColor = isHoveredOrSelected ? "#F8FAFC" : colorClass;

    switch (type) {
      case "equipment":
        // Octagon shape for heavy machinery
        return (
          <polygon
            points={`0,-${size} ${size*0.7},-${size*0.7} ${size},0 ${size*0.7},${size*0.7} 0,${size} -${size*0.7},${size*0.7} -${size},0 -${size*0.7},-${size*0.7}`}
            fill={iconBg}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            className="transition-all duration-200"
          />
        );
      case "regulatory":
        // Shield shape for strict regulations
        return (
          <path
            d={`M -${size},-${size*0.6} L ${size},-${size*0.6} L ${size},0 C ${size},${size*0.7} 0,${size*1.1} 0,${size*1.1} C 0,${size*1.1} -${size},${size*0.7} -${size},0 Z`}
            fill={iconBg}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            className="transition-all duration-200"
          />
        );
      case "personnel":
        // Hexagonal container for staff
        return (
          <polygon
            points={`0,-${size} ${size*0.86},-${size*0.5} ${size*0.86},${size*0.5} 0,${size} -${size*0.86},${size*0.5} -${size*0.86},-${size*0.5}`}
            fill={iconBg}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            className="transition-all duration-200"
          />
        );
      case "document":
      default:
        // Square with folded edge
        return (
          <rect
            x={-size}
            y={-size}
            width={size * 2}
            height={size * 2}
            rx={3}
            fill={iconBg}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            className="transition-all duration-200"
          />
        );
    }
  };

  const renderNodeIcon = (type: string) => {
    switch (type) {
      case "document":
        return (
          <g stroke="currentColor" fill="none" strokeWidth="1.2" className="text-amber-500">
            <path d="M-5,-7 H2 L6,-3 V7 H-5 Z" />
            <path d="M2,-7 V-3 H6" />
            <line x1="-3" y1="0" x2="3" y2="0" strokeWidth="1" />
            <line x1="-3" y1="3" x2="3" y2="3" strokeWidth="1" />
          </g>
        );
      case "equipment":
        return (
          <g stroke="currentColor" fill="none" strokeWidth="1.2" className="text-orange-500">
            <circle r="3.5" />
            <path d="M0,-3.5 V-6.5 M0,3.5 V6.5 M-3.5,0 H-6.5 M3.5,0 H6.5 M-2.5,-2.5 L-4.5,-4.5 M2.5,2.5 L4.5,4.5 M-2.5,2.5 L-4.5,4.5 M2.5,-2.5 L4.5,-4.5" />
          </g>
        );
      case "personnel":
        return (
          <g stroke="currentColor" fill="none" strokeWidth="1.2" className="text-purple-400">
            <circle cx="0" cy="-2.5" r="2.5" />
            <path d="M-5,5 C-5,2 -2.5,1.5 0,1.5 S5,2 5,5" />
          </g>
        );
      case "regulatory":
        return (
          <g stroke="currentColor" fill="none" strokeWidth="1.2" className="text-blue-400">
            <path d="M-4,-4 H4 V-1 C4,1.5 0,3.5 0,3.5 S-4,1.5 -4,-1 Z" />
            <line x1="-1.5" y1="-1.5" x2="1.5" y2="-1.5" strokeWidth="1" />
            <line x1="-1.5" y1="0.5" x2="1.5" y2="0.5" strokeWidth="1" />
          </g>
        );
      default:
        return <circle r="2.5" fill="currentColor" />;
    }
  };

  return (
    <div id="graph-explorer-view" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch h-full lg:h-[calc(100vh-220px)] flex-1 min-h-0">
      {/* Custom Styles Injection for Flowing Signal Particles */}
      <style>{`
        @keyframes flowDash {
          to {
            stroke-dashoffset: -20;
          }
        }
        .flow-animation {
          animation: flowDash 0.75s linear infinite;
        }
      `}</style>

      {/* LEFT COLUMN: GRAPH CANVAS */}
      <div id="graph-canvas-column" className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4 h-full min-h-[480px] lg:min-h-0 relative">
        
        {/* Graph Controls & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          
          {/* Quick Node Type Filter */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "all", label: "ALL ENTITIES", color: "border-amber-500/30" },
              { id: "document", label: "DOCUMENTS", color: "border-amber-500/30" },
              { id: "equipment", label: "ASSETS", color: "border-orange-500/30" },
              { id: "personnel", label: "STAFF", color: "border-purple-500/30" },
              { id: "regulatory", label: "STANDARDS", color: "border-blue-500/30" }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => {
                  setActiveFilter(f.id);
                  setSelectedNode(null);
                }}
                className={`px-3 py-1 text-[10px] font-mono rounded border transition-all ${
                  activeFilter === f.id
                    ? "bg-amber-500 border-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/10"
                    : `bg-slate-950 ${f.color} text-slate-400 hover:text-slate-200 hover:bg-slate-850`
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Combined Search bar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search properties, tags, names..."
              className="bg-slate-950 border border-slate-850 rounded px-3 py-1.5 pl-8 text-[11px] text-slate-300 placeholder-slate-500 focus:outline-none focus:border-amber-500 w-[200px] md:w-[240px] font-mono"
            />
          </div>
        </div>

        {/* 2D Constellation Force-Directed Canvas */}
        <div className="relative bg-slate-950 border border-slate-850 rounded-xl overflow-hidden flex items-center justify-center min-h-[380px] lg:min-h-0 lg:flex-1">
          
          {/* Tactical blueprint dotted grid background */}
          <div 
            id="bg-grid"
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#F59E0B 1px, transparent 1px)",
              backgroundSize: "24px 24px"
            }}
          />

          {/* Interactive Zoom/Pan Controls Hud */}
          <div className="absolute top-3 right-3 flex flex-col space-y-1 bg-slate-900/90 p-1.5 rounded-lg border border-slate-800 shadow-xl z-20">
            <button
              onClick={() => triggerZoom("in")}
              className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-amber-500 transition-colors"
              title="Zoom In (+)"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={() => triggerZoom("out")}
              className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-amber-500 transition-colors"
              title="Zoom Out (-)"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              onClick={resetViewport}
              className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-amber-500 transition-colors font-mono text-[9px] font-bold"
              title="Recenter & Re-settle simulation"
            >
              <Maximize2 className="h-4 w-4 mx-auto" />
            </button>
          </div>

          {/* Background Overlay Hint */}
          <div id="bg-overlay" className="absolute top-3 left-3 text-[9px] font-mono text-slate-500 bg-slate-900/80 px-2 py-1 rounded border border-slate-800 pointer-events-none select-none">
            🖱️ CLICK BACKGROUND TO DRAG/PAN • SCROLL TO ZOOM • DRAG NODES TO LAYOUT
          </div>

          {loading ? (
            <div className="flex flex-col items-center space-y-2 font-mono text-xs text-slate-400 select-none">
              <RefreshCw className="h-5 w-5 animate-spin text-amber-500" />
              <span>DYNAMICALLY GENERATING FORCE CLUSTERS...</span>
            </div>
          ) : graphData.nodes.length === 0 ? (
            <div className="text-center font-mono text-xs text-slate-500 select-none">
              No entities found in knowledge pool. Ingest refinery documents first.
            </div>
          ) : (
            <svg 
              ref={svgRef}
              viewBox={`0 0 ${width} ${height}`} 
              className="w-full h-full max-h-[450px] select-none cursor-grab active:cursor-grabbing"
              onPointerDown={handleBgPointerDown}
              onPointerMove={handleBgPointerMove}
              onPointerUp={handleBgPointerUp}
              onWheel={handleWheel}
            >
              {/* Filter glow definitions */}
              <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* TRANSLATED VIEWPORT GROUP */}
              <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                
                {/* DRAW RELATION LINKS */}
                <g id="links-group">
                  {simulationLinks.map((link, idx) => {
                    // source and target will be objects due to D3 binding
                    const sourceNode = link.source as D3Node;
                    const targetNode = link.target as D3Node;

                    if (!sourceNode || !targetNode || sourceNode.x === undefined || targetNode.x === undefined) {
                      return null;
                    }

                    const sourceId = sourceNode.id;
                    const targetId = targetNode.id;

                    const isHighlighted = (hoveredNodeId || selectedNode?.id) 
                      ? activeNeighbors.has(sourceId) && activeNeighbors.has(targetId)
                      : false;

                    const isDimmed = (hoveredNodeId || selectedNode?.id) && !isHighlighted;

                    // Color code relationships dynamically
                    let strokeColor = "#475569"; // default Slate-600
                    if (link.relationship === "governed_by") strokeColor = "#3B82F6"; // Blue
                    else if (link.relationship === "approved_permit" || link.relationship === "issued_permit" || link.relationship === "covered_by_permit") strokeColor = "#A855F7"; // Purple
                    else if (link.relationship === "maintained_by") strokeColor = "#F97316"; // Orange
                    else if (link.relationship === "references_standard") strokeColor = "#EF4444"; // Red / Rose
                    else if (link.relationship === "located_in" || link.relationship === "inspected") strokeColor = "#F59E0B"; // Amber

                    const opacity = isDimmed ? 0.05 : (isHighlighted ? 0.95 : 0.35);

                    return (
                      <g key={idx}>
                        {/* Underlay thick line for easy hovering */}
                        <line
                          x1={sourceNode.x}
                          y1={sourceNode.y}
                          x2={targetNode.x}
                          y2={targetNode.y}
                          stroke="transparent"
                          strokeWidth={10}
                          className="cursor-pointer"
                        />

                        {/* Solid base connection link */}
                        <line
                          x1={sourceNode.x}
                          y1={sourceNode.y}
                          x2={targetNode.x}
                          y2={targetNode.y}
                          stroke={strokeColor}
                          strokeWidth={isHighlighted ? 2.2 : 1}
                          strokeOpacity={opacity}
                          className="transition-all duration-300"
                        />

                        {/* Flowing animated signal particles along highlighted connections */}
                        {isHighlighted && (
                          <line
                            x1={sourceNode.x}
                            y1={sourceNode.y}
                            x2={targetNode.x}
                            y2={targetNode.y}
                            stroke={strokeColor}
                            strokeWidth={2.5}
                            strokeDasharray="5,15"
                            className="flow-animation text-slate-100"
                            strokeOpacity={0.8}
                          />
                        )}

                        {/* Link Text Badge */}
                        {isHighlighted && (
                          <g transform={`translate(${(sourceNode.x + targetNode.x)/2}, ${(sourceNode.y + targetNode.y)/2})`}>
                            <rect
                              x={-35}
                              y={-7}
                              width={70}
                              height={14}
                              rx={3}
                              fill="#030712"
                              stroke={strokeColor}
                              strokeWidth={0.75}
                              className="opacity-95 shadow-md"
                            />
                            <text
                              fill="#f8fafc"
                              fontSize="6"
                              fontFamily="monospace"
                              fontWeight="bold"
                              textAnchor="middle"
                              dominantBaseline="central"
                              letterSpacing="0.06em"
                              className="pointer-events-none select-none uppercase"
                            >
                              {link.relationship}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </g>

                {/* DRAW ENTITY NODES */}
                <g id="nodes-group">
                  {searchedNodes.map((node) => {
                    if (node.x === undefined || node.y === undefined) return null;

                    const isHovered = hoveredNodeId === node.id;
                    const isSelected = selectedNode?.id === node.id;
                    const isNeighbor = activeNeighbors.has(node.id);
                    const hasActiveFocus = hoveredNodeId || selectedNode?.id;

                    // Node styling properties depending on type
                    let size = 15;
                    let colorClass = "#F59E0B"; // Default amber
                    let iconBg = "#111827";

                    if (node.type === "document") {
                      size = 17;
                      colorClass = "#F59E0B"; // Golden amber
                      iconBg = "#1C1405";
                    } else if (node.type === "equipment") {
                      size = 16;
                      colorClass = "#F97316"; // Bright Orange
                      iconBg = "#221105";
                    } else if (node.type === "regulatory") {
                      size = 16;
                      colorClass = "#3B82F6"; // Cobalt Blue
                      iconBg = "#051329";
                    } else if (node.type === "personnel") {
                      size = 15;
                      colorClass = "#A855F7"; // Electric Purple
                      iconBg = "#170524";
                    }

                    // Check for anomalous warns
                    const dynamicProperties = {
                      ...(node.properties || {}),
                      ...(customProperties[node.id] || {})
                    };
                    const hasWarning = Object.values(dynamicProperties).some(v => 
                      String(v).toUpperCase().includes("WARNING") || String(v).toUpperCase().includes("BREACH") || String(v).toUpperCase().includes("SPIKE")
                    );

                    if (hasWarning) {
                      colorClass = "#EF4444"; // RED flag
                      iconBg = "#270808";
                    }

                    let opacity = 1;
                    if (hasActiveFocus && !isNeighbor) {
                      opacity = 0.18; // Heavy deemphasis of unrelated nodes
                    }

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${node.x}, ${node.y})`}
                        className="cursor-pointer transition-all duration-300"
                        onMouseEnter={() => setHoveredNodeId(node.id)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        onPointerDown={(e) => handleNodePointerDown(e, node)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNode(node);
                        }}
                        opacity={opacity}
                      >
                        {/* Pulse Glowing Halo on hover/select */}
                        {(isHovered || isSelected) && (
                          <circle
                            r={size + 7}
                            fill="none"
                            stroke={colorClass}
                            strokeWidth={0.8}
                            strokeDasharray="4,4"
                            className="animate-[spin_12s_linear_infinite]"
                            filter="url(#glow)"
                          />
                        )}

                        {/* Core Node Geometrical Shape */}
                        {renderNodeShape(node.type, size, colorClass, iconBg, isHovered || isSelected)}

                        {/* Inline Vector Icon */}
                        {renderNodeIcon(node.type)}

                        {/* Operational Status Flag (Nominal or Alarm) */}
                        {hasWarning && (
                          <circle
                            cx={size - 3}
                            cy={-size + 3}
                            r={4}
                            fill="#EF4444"
                            className="animate-pulse"
                            stroke="#1E1B4B"
                            strokeWidth={1}
                          />
                        )}

                        {/* Elegant Dotted Tagging Label directly underneath */}
                        <text
                          y={size + 13}
                          fill={isHovered || isSelected ? "#F8FAFC" : "#94A3B8"}
                          fontSize="8"
                          fontFamily="monospace"
                          fontWeight={isHovered || isSelected ? "bold" : "medium"}
                          textAnchor="middle"
                          className="transition-colors pointer-events-none tracking-tight"
                        >
                          {node.label}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </g>
            </svg>
          )}

          {/* Color-Code / Shape Legend Overlay */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2.5 bg-slate-900/90 px-3 py-2 rounded-lg border border-slate-800 text-[9px] font-mono text-slate-400 select-none shadow-lg">
            <span className="flex items-center"><span className="w-2.5 h-2.5 bg-amber-500/10 border border-amber-500 rounded-sm mr-1.5" /> DOCS</span>
            <span className="flex items-center"><span className="w-2.5 h-2.5 bg-orange-500/10 border border-orange-500 rounded-sm mr-1.5" /> ASSETS (HEX)</span>
            <span className="flex items-center"><span className="w-2.5 h-2.5 bg-purple-500/10 border border-purple-500 rounded-sm mr-1.5" /> STAFF (HEX)</span>
            <span className="flex items-center"><span className="w-2.5 h-2.5 bg-blue-500/10 border border-blue-500 rounded-sm mr-1.5" /> STANDARDS (SHIELD)</span>
            <span className="flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-1.5 animate-ping" /> ANOMALY</span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: PROPERTY INSPECTOR */}
      <div id="graph-inspector-column" className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col overflow-hidden justify-between h-[520px] lg:h-full lg:min-h-0">
        <div className="space-y-4 flex-1 overflow-y-auto pr-1">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Layers className="h-4 w-4 text-amber-500" />
              <h4 className="font-sans font-bold text-xs text-slate-200 uppercase tracking-wider">
                Refinery Entity Ledger
              </h4>
            </div>
            {selectedNode && (
              <span className="text-[8px] font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-500 font-bold uppercase">
                {selectedNode.type}
              </span>
            )}
          </div>

          <AnimatePresence mode="wait">
            {selectedNode ? (
              <motion.div
                key={selectedNode.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Inspector Header */}
                <div className="space-y-1">
                  <h3 className="font-sans font-bold text-slate-100 text-base leading-tight">
                    {selectedNode.label}
                  </h3>
                  <p className="font-mono text-[10px] text-amber-500/80">{selectedNode.subtitle}</p>
                </div>

                {/* Dynamic and Effective Categorized Properties Grid */}
                <div className="bg-slate-950/40 rounded-lg p-3.5 border border-slate-900 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                      OPERATIONAL CHARACTERISTICS & METADATA
                    </span>
                    <Database className="h-3.5 w-3.5 text-slate-600" />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2">
                    {/* Merge backend dynamic properties with any user custom local tagged properties */}
                    {Object.entries({
                      ...(selectedNode.properties || {}),
                      ...(customProperties[selectedNode.id] || {})
                    }).map(([key, value]) => {
                      const isUserCustom = customProperties[selectedNode.id]?.[key] !== undefined;
                      return renderPropertyItem(key, value, isUserCustom);
                    })}

                    {Object.keys({
                      ...(selectedNode.properties || {}),
                      ...(customProperties[selectedNode.id] || {})
                    }).length === 0 && (
                      <span className="text-slate-600 text-[10px] font-mono block p-4 text-center border border-dashed border-slate-850 rounded">
                        No properties established for this node yet.
                      </span>
                    )}
                  </div>
                </div>

                {/* Neighbor Linkages list */}
                <div className="space-y-2">
                  <span className="text-[10px] font-sans font-bold text-slate-500 uppercase tracking-wider block">
                    ACTIVE CORRELATIONS ({activeNeighbors.size - 1})
                  </span>
                  
                  <div className="space-y-1 max-h-[120px] overflow-y-auto">
                    {Array.from(activeNeighbors).map(nbId => {
                      if (nbId === selectedNode.id) return null;
                      const neighbor = graphData.nodes.find(n => n.id === nbId);
                      if (!neighbor) return null;

                      let typeColor = "text-amber-500";
                      if (neighbor.type === "equipment") typeColor = "text-orange-500";
                      if (neighbor.type === "personnel") typeColor = "text-purple-400";
                      if (neighbor.type === "regulatory") typeColor = "text-blue-400";

                      return (
                        <div 
                          key={neighbor.id}
                          onClick={() => {
                            // Find the simulated copy to ensure coordinates bind correctly
                            const simCopy = simulationNodes.find(sn => sn.id === neighbor.id);
                            if (simCopy) setSelectedNode(simCopy);
                          }}
                          className="flex items-center justify-between p-2 bg-slate-950 hover:bg-slate-850 rounded border border-slate-850 cursor-pointer text-[10px] text-slate-300 transition-colors"
                        >
                          <span className="truncate font-mono font-medium">{neighbor.label}</span>
                          <span className={`text-[8px] font-mono uppercase ${typeColor}`}>{neighbor.type}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* INTERACTIVE PROPERTY EDITOR: TAG EXTRA CUSTOM METADATA LIVE */}
                <form onSubmit={handleAddProperty} className="border-t border-slate-800 pt-4 mt-2 space-y-2.5">
                  <div className="flex items-center space-x-1.5 text-amber-500">
                    <Tag className="h-3.5 w-3.5" />
                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider">
                      Add Custom Property / Tag Metadata
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newPropKey}
                      onChange={(e) => setNewPropKey(e.target.value)}
                      placeholder="Property Name (e.g. Serial)"
                      className="bg-slate-950 border border-slate-850 rounded px-2.5 py-1 text-[10px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                      required
                    />
                    <input
                      type="text"
                      value={newPropValue}
                      onChange={(e) => setNewPropValue(e.target.value)}
                      placeholder="Value (e.g. SN-89420)"
                      className="bg-slate-950 border border-slate-850 rounded px-2.5 py-1 text-[10px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 text-[10px] font-mono py-1.5 px-3 rounded flex items-center justify-center gap-1.5 cursor-pointer uppercase font-bold"
                  >
                    <Plus className="h-3.5 w-3.5 text-amber-500" /> TAG CUSTOM METADATA
                  </button>

                  <AnimatePresence>
                    {propSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center space-x-1.5 text-emerald-400 text-[9px] font-mono justify-center"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        <span>METADATA INJECTED SUCCESSFULLY</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>

              </motion.div>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-center text-slate-500 select-none">
                <Info className="h-5 w-5 text-slate-600 mb-2 animate-pulse" />
                <p className="text-xs font-sans font-bold">Consolidated Operations Graph</p>
                <p className="text-[10px] text-slate-600 mt-1 max-w-[190px] leading-normal font-mono">
                  Select any node (Asset, Staff profile, Standard, or Document dossier) on the graph to display, audit, and inject properties.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Graph Summary Metrics Panel */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-850/60 mt-4">
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
            <div>
              <span className="text-slate-500 text-[8px] block uppercase">NODES</span>
              <span className="text-amber-500 font-bold text-sm">{simulationNodes.length}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[8px] block uppercase">RELATIONS</span>
              <span className="text-slate-200 font-bold text-sm">{simulationLinks.length}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[8px] block uppercase">PROPERTIES</span>
              <span className="text-slate-200 font-bold text-sm">
                {simulationNodes.reduce((acc, curr) => {
                  const baseCount = Object.keys(curr.properties || {}).length;
                  const customCount = Object.keys(customProperties[curr.id] || {}).length;
                  return acc + baseCount + customCount;
                }, 0)}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
