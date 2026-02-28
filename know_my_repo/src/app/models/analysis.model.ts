/** Response from POST /api/analyze/:repoId */
export interface AnalysisResult {
  repoId: string;
  projectType?: string;
  entryPoint?: string;
  architectureStyle?: string;
  frameworks?: string[];
  database?: string;
  layers?: ArchitectureLayer[];
  workflows?: WorkflowSummary[];
  risks?: RiskItem[];
  coreComponents?: string[];
  /** Mermaid flowchart definition or list of steps for execution flow */
  executionFlow?: string;
  /** File path -> importance score 0-100 for heatmap */
  importantFiles?: ImportantFile[];
  /** Circular dependency chains for warning */
  circularDependencies?: string[];
  /** Route -> controller/service/model trace for interactive trace */
  routeTraces?: RouteTrace[];
}

export interface ImportantFile {
  path: string;
  importance: number;
  label?: string;
}

export interface RouteTrace {
  route: string;
  controller?: string;
  service?: string;
  model?: string;
}

export interface ArchitectureLayer {
  name: string;
  description?: string;
  components?: string[];
}

export interface WorkflowSummary {
  name: string;
  description?: string;
}

export interface RiskItem {
  title: string;
  severity?: 'low' | 'medium' | 'high';
  description?: string;
}
