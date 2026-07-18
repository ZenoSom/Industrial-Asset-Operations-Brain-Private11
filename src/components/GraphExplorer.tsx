import React, { useState, useEffect, useRef } from "react";
import { GraphNode, GraphLink, GraphData } from "../types";
import { FileText, User, Shield, Zap, Search, Info, RefreshCw, Layers } from "lucide-react";
import { motion } from "motion/react";

interface GraphExplorerProps {
  documents: any[]; // trigger re-render on active document changes
}

export default function GraphExplorer({ documents }: GraphExplorerProps) {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");

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

  // Layout calculations: Since standard canvas libraries can be buggy in sandboxed iframes,
  // we layout nodes in cluster configurations based on their types for a clean, stable, engineered CAD look.
  const width = 600;
  const height = 450;

  // Let's generate coordinates for each node based on a clean circular constellation or multi-cluster layout
  const getLayoutNodes = () => {
    const { nodes, links } = graphData;
    if (nodes.length === 0) return [];

    // Filter nodes first based on active controls
    const filteredNodes = nodes.filter(n => {
      if (activeFilter === "all") return true;
      return n.type === activeFilter;
    });

    const docNodes = filteredNodes.filter(n => n.type === "document");
    const equipNodes = filteredNodes.filter(n => n.type === "equipment");
    const persNodes = filteredNodes.filter(n => n.type === "personnel");
    const regNodes = filteredNodes.filter(n => n.type === "regulatory");

    const layoutNodes = [] as any[];

    // Cluster Centers
    const centers = {
      document: { x: width / 2, y: height / 2 },          // Center
      equipment: { x: width * 0.18, y: height * 0.25 },     // Top Left
      regulatory: { x: width * 0.82, y: height * 0.25 },    // Top Right
      personnel: { x: width * 0.5, y: height * 0.82 }       // Bottom
    };

    // Distribute nodes in circles around their cluster centers
    const distributeInCircle = (nodeList: GraphNode[], center: { x: number, y: number }, radius: number) => {
      nodeList.forEach((node, idx) => {
        const total = nodeList.length;
        const angle = total > 1 ? (idx / total) * Math.PI * 2 : 0;
        const x = center.x + Math.cos(angle) * radius;
        const y = center.y + Math.sin(angle) * radius;
        layoutNodes.push({ ...node, x, y });
      });
    };

    distributeInCircle(docNodes, centers.document, docNodes.length > 1 ? 55 : 0);
    distributeInCircle(equipNodes, centers.equipment, equipNodes.length > 1 ? 40 : 0);
    distributeInCircle(regNodes, centers.regulatory, regNodes.length > 1 ? 40 : 0);
    distributeInCircle(persNodes, centers.personnel, persNodes.length > 1 ? 40 : 0);

    return layoutNodes;
  };

  const currentLayoutNodes = getLayoutNodes();

  // Find neighbors of the hovered or selected node
  const getLinkedNodeIds = (nodeId: string | null) => {
    if (!nodeId) return new Set<string>();
    const neighbors = new Set<string>();
    neighbors.add(nodeId);
    graphData.links.forEach(l => {
      if (l.source === nodeId) neighbors.add(l.target);
      if (l.target === nodeId) neighbors.add(l.source);
    });
    return neighbors;
  };

  const activeNeighbors = getLinkedNodeIds(hoveredNodeId || selectedNode?.id || null);

  // Search filter
  const searchedNodes = currentLayoutNodes.filter(n => {
    if (!searchQuery) return true;
    return n.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
           n.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div id="graph-explorer-view" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch h-full lg:h-[calc(100vh-220px)] flex-1 min-h-0">
      {/* LEFT COLUMN: GRAPH CANVAS */}
      <div id="graph-canvas-column" className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4 h-full min-h-[450px] lg:min-h-0">
        
        {/* Graph Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          {/* Quick Node Type Filter */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "all", label: "ALL ENTITIES" },
              { id: "document", label: "DOCUMENTS" },
              { id: "equipment", label: "ASSETS" },
              { id: "personnel", label: "STAFF" },
              { id: "regulatory", label: "STANDARDS" }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => {
                  setActiveFilter(f.id);
                  setSelectedNode(null);
                }}
                className={`px-3 py-1 text-[10px] font-mono rounded border transition-all ${
                  activeFilter === f.id
                    ? "bg-amber-500 border-amber-600 text-slate-950 font-bold"
                    : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search bar inside canvas header */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search equipment, codes, tags..."
              className="bg-slate-950 border border-slate-850 rounded px-3 py-1.5 pl-8 text-[11px] text-slate-300 placeholder-slate-500 focus:outline-none focus:border-amber-500 w-[180px] md:w-[220px]"
            />
          </div>
        </div>

        {/* 2D Constellation Canvas Area */}
        <div className="relative bg-slate-950 border border-slate-850 rounded-xl overflow-hidden flex items-center justify-center min-h-[350px] lg:min-h-0 lg:flex-1">
          {/* Tactical blueprint dotted grid background */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(#F59E0B 1px, transparent 1px)",
              backgroundSize: "20px 20px"
            }}
          />

          {loading ? (
            <div className="flex flex-col items-center space-y-2 font-mono text-xs text-slate-400 select-none">
              <RefreshCw className="h-5 w-5 animate-spin text-amber-500" />
              <span>RECOMPILING GRAPH...</span>
            </div>
          ) : graphData.nodes.length === 0 ? (
            <div className="text-center font-mono text-xs text-slate-500 select-none">
              No entities found in knowledge pool. Upload documents first.
            </div>
          ) : (
            <svg 
              viewBox={`0 0 ${width} ${height}`} 
              className="w-full h-full max-h-[420px] select-none"
            >
              {/* DRAW RELATION LINKS */}
              <g id="graph-links-layer">
                {graphData.links.map((link, idx) => {
                  const sourceNode = currentLayoutNodes.find(n => n.id === link.source);
                  const targetNode = currentLayoutNodes.find(n => n.id === link.target);

                  if (!sourceNode || !targetNode) return null;

                  // Highlighting link logic: light up link if source or target are in the active neighbors set
                  const isHighlighted = (hoveredNodeId || selectedNode?.id) 
                    ? activeNeighbors.has(link.source) && activeNeighbors.has(link.target)
                    : false;

                  const isDimmed = (hoveredNodeId || selectedNode?.id) && !isHighlighted;

                  return (
                    <g key={idx}>
                      <line
                        x1={sourceNode.x}
                        y1={sourceNode.y}
                        x2={targetNode.x}
                        y2={targetNode.y}
                        stroke={isHighlighted ? "#F59E0B" : "#1E293B"}
                        strokeWidth={isHighlighted ? 1.5 : 1}
                        strokeOpacity={isDimmed ? 0.15 : 0.8}
                        strokeDasharray={link.relationship === "GOVERNED_BY" ? "3,3" : undefined}
                        className="transition-all duration-300"
                      />
                      {/* Optional: Small relation text badges when hovered */}
                      {isHighlighted && (
                        <text
                          x={(sourceNode.x + targetNode.x) / 2}
                          y={(sourceNode.y + targetNode.y) / 2 - 4}
                          fill="#D97706"
                          fontSize="7"
                          fontFamily="monospace"
                          textAnchor="middle"
                          className="bg-slate-950"
                        >
                          {link.relationship}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>

              {/* DRAW ENTITY NODES */}
              <g id="graph-nodes-layer">
                {searchedNodes.map((node) => {
                  const isHovered = hoveredNodeId === node.id;
                  const isSelected = selectedNode?.id === node.id;
                  const isNeighbor = activeNeighbors.has(node.id);
                  const hasActiveFocus = hoveredNodeId || selectedNode?.id;

                  // Node styled size and coloring based on type
                  let size = 16;
                  let colorClass = "#F59E0B"; // Amber
                  let iconBg = "#1E1B10";

                  if (node.type === "document") {
                    size = 19;
                    colorClass = "#F59E0B"; // Golden amber
                    iconBg = "#221C11";
                  } else if (node.type === "equipment") {
                    colorClass = "#E07A10"; // Dark Orange
                    iconBg = "#241810";
                  } else if (node.type === "regulatory") {
                    colorClass = "#3B82F6"; // Cobalt Blue
                    iconBg = "#0F1C36";
                  } else if (node.type === "personnel") {
                    colorClass = "#A855F7"; // Purple
                    iconBg = "#1F1235";
                  }

                  let opacity = 1;
                  if (hasActiveFocus && !isNeighbor) {
                    opacity = 0.25;
                  }

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      className="cursor-pointer transition-all duration-300"
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      onClick={() => setSelectedNode(node)}
                      opacity={opacity}
                    >
                      {/* Node Pulsing Halo */}
                      {(isHovered || isSelected) && (
                        <circle
                          r={size + 8}
                          fill="none"
                          stroke={colorClass}
                          strokeWidth={0.75}
                          strokeDasharray="4,4"
                          className="animate-spin"
                          style={{ transformOrigin: "0px 0px" }}
                        />
                      )}

                      {/* Main Node Body */}
                      <circle
                        r={size}
                        fill={iconBg}
                        stroke={isHovered || isSelected ? "#F8FAFC" : colorClass}
                        strokeWidth={isSelected ? 2 : 1.2}
                        className="transition-all"
                      />

                      {/* Micro Inner Type Markings */}
                      <circle
                        r={3}
                        cy={-size + 2}
                        fill={colorClass}
                      />

                      {/* Compact Node Label underneath */}
                      <text
                        y={size + 13}
                        fill={isHovered || isSelected ? "#F8FAFC" : "#94A3B8"}
                        fontSize="8"
                        fontFamily="monospace"
                        fontWeight={isHovered || isSelected ? "bold" : "normal"}
                        textAnchor="middle"
                        className="transition-colors pointer-events-none"
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          )}

          {/* Bottom Indicators bar */}
          <div className="absolute bottom-3 left-3 flex items-center space-x-3 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800 text-[9px] font-mono text-slate-400">
            <span className="flex items-center"><span className="h-1.5 w-1.5 bg-amber-500 rounded-full mr-1" /> DOCS</span>
            <span className="flex items-center"><span className="h-1.5 w-1.5 bg-orange-500 rounded-full mr-1" /> ASSETS</span>
            <span className="flex items-center"><span className="h-1.5 w-1.5 bg-purple-500 rounded-full mr-1" /> STAFF</span>
            <span className="flex items-center"><span className="h-1.5 w-1.5 bg-blue-500 rounded-full mr-1" /> REGULATORY</span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: PROPERTY INSPECTOR */}
      <div id="graph-inspector-column" className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col overflow-hidden justify-between h-[480px] lg:h-full lg:min-h-0">
        <div className="space-y-4 flex-1 overflow-y-auto pr-1">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Layers className="h-4 w-4 text-amber-500" />
            <h4 className="font-sans font-bold text-xs text-slate-200 uppercase tracking-wider">
              Entity Property Inspector
            </h4>
          </div>

          {selectedNode ? (
            <div className="space-y-4">
              {/* Inspector Header */}
              <div className="space-y-1">
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 bg-slate-950 border border-slate-850 text-slate-400 rounded">
                  {selectedNode.type}
                </span>
                <h3 className="font-sans font-bold text-slate-100 text-base leading-tight">
                  {selectedNode.label}
                </h3>
                <p className="font-mono text-[10px] text-slate-500">{selectedNode.subtitle}</p>
              </div>

              {/* Node Type Specific Properties */}
              <div className="bg-slate-950 rounded-lg p-3.5 border border-slate-850 space-y-3">
                <span className="text-[10px] font-sans font-bold text-slate-500 uppercase tracking-wider block">
                  METADATA PROPERTIES
                </span>
                
                <div className="space-y-2 text-xs font-mono">
                  {selectedNode.type === "document" && (
                    <>
                      <div>
                        <span className="text-slate-500 text-[9px] block">DOCUMENT IDENTIFIER</span>
                        <span className="text-slate-300">{selectedNode.id}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[9px] block">ORIGINAL FILENAME</span>
                        <span className="text-slate-300">{selectedNode.label}</span>
                      </div>
                    </>
                  )}

                  {selectedNode.type === "equipment" && (
                    <>
                      <div>
                        <span className="text-slate-500 text-[9px] block">SYSTEM TAG ID</span>
                        <span className="text-amber-400 font-bold">{selectedNode.id}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[9px] block">ASSET CLASSIFICATION</span>
                        <span className="text-slate-300">Mechanical Process Assembly</span>
                      </div>
                    </>
                  )}

                  {selectedNode.type === "personnel" && (
                    <>
                      <div>
                        <span className="text-slate-500 text-[9px] block">REPRESENTATIVE NAME</span>
                        <span className="text-purple-400">{selectedNode.id}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[9px] block">PLANT COGNIZANT RESPONSIBILITY</span>
                        <span className="text-slate-300">Operations Sign-off Supervisor</span>
                      </div>
                    </>
                  )}

                  {selectedNode.type === "regulatory" && (
                    <>
                      <div>
                        <span className="text-slate-500 text-[9px] block">SAFETY / COMPLIANCE STANDARD</span>
                        <span className="text-blue-400 font-bold">{selectedNode.id}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[9px] block">ISSUING AUTHORITY</span>
                        <span className="text-slate-300">PESO / Ministry of Petroleum & Gas</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Neighbors list in inspector */}
              <div className="space-y-2">
                <span className="text-[10px] font-sans font-bold text-slate-500 uppercase tracking-wider block">
                  SEMANTIC LINKAGES ({activeNeighbors.size - 1})
                </span>
                
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                  {Array.from(activeNeighbors).map(nbId => {
                    if (nbId === selectedNode.id) return null;
                    const neighbor = graphData.nodes.find(n => n.id === nbId);
                    if (!neighbor) return null;

                    return (
                      <div 
                        key={neighbor.id}
                        onClick={() => setSelectedNode(neighbor)}
                        className="flex items-center justify-between p-2 bg-slate-950 hover:bg-slate-850/80 rounded border border-slate-850 cursor-pointer text-[10px] text-slate-300 transition-colors"
                      >
                        <span className="truncate font-mono font-medium">{neighbor.label}</span>
                        <span className="text-[8px] font-mono text-slate-500 uppercase capitalize">{neighbor.type}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[240px] flex flex-col items-center justify-center text-center text-slate-500 select-none">
              <Info className="h-5 w-5 text-slate-600 mb-2" />
              <p className="text-xs font-sans">No Node Selected</p>
              <p className="text-[10px] text-slate-600 mt-1 max-w-[160px]">
                Click any asset node, document node, or safety standard on the graph constellation to inspect active relationships.
              </p>
            </div>
          )}
        </div>

        {/* Graph Summary Stats */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-850/60 mt-4">
          <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
            <div>
              <span className="text-slate-500 text-[9px] block">TOTAL NODES</span>
              <span className="text-slate-200 font-bold">{graphData.nodes.length}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[9px] block">ACTIVE EDGES</span>
              <span className="text-slate-200 font-bold">{graphData.links.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
