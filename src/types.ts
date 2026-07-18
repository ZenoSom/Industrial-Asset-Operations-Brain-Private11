export interface IngestedDocument {
  id: string;
  title: string;
  category: "specification" | "maintenance" | "permit" | "regulatory" | "other";
  fileName: string;
  content: string;
  uploadDate: string;
  fileSize: string;
  extractedEntities: {
    tags: string[];
    dates: string[];
    personnel: string[];
    standards: string[];
    parameters: string[];
  };
}

export interface Citation {
  sourceDocument: string;
  snippet: string;
  pageOrSection: string;
  relevance: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  confidence?: "High" | "Medium" | "Low";
  confidenceScore?: number;
  citations?: Citation[];
  isLoading?: boolean;
}

export interface GraphNode {
  id: string;
  label: string;
  type: "document" | "equipment" | "personnel" | "regulatory";
  subtitle: string;
}

export interface GraphLink {
  source: string;
  target: string;
  relationship: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface OperationalGap {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  equipmentTag: string;
  description: string;
  recommendation: string;
  type: string;
  sourceRef: string;
}

export interface PlantStats {
  totalDocuments: number;
  linkedAssets: number;
  activePermits: number;
  unresolvedAnomalies: number;
  complianceScore: number;
}
