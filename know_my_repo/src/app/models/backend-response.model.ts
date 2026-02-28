/** Raw response from POST /api/analyze (backend format) */
export interface BackendAnalyzeResponse {
  repoUrl: string;
  language?: string;
  projectType?: string;
  framework?: string;
  architecture?: string;
  entryPoint?: string;
  folderTree?: unknown;
  folderTreeText?: string;
  routes?: { method: string; path: string; handler?: string; sourceFile?: string }[];
  controllers?: { name: string; file?: string; methods?: string[] }[];
  models?: { name: string; file?: string; schemaSummary?: string }[];
  services?: { name: string; file?: string }[];
  applicationConfig?: string | null;
  frontendModules?: FrontendModule[];
  mlModules?: MLModule[];
  readmeSummary?: string | null;
  explanation?: {
    summary?: string;
    executionFlow?: string;
    folderTreeText?: string;
  };
}

export interface FrontendModule {
  root?: string;
  framework?: string;
  entryPoint?: string;
  components?: string[];
  pages?: string[];
  routes?: { path: string; component?: string; type?: string; file?: string }[];
  stateManagement?: string[];
  renderMode?: string;
  executionFlow?: string;
}

export interface MLModule {
  root?: string;
  libs?: string[];
  trainingScripts?: string[];
  inferenceScripts?: string[];
  preprocessingScripts?: string[];
  evaluationScripts?: string[];
  notebooks?: string[];
  datasetFolders?: string[];
  pipelineExplanation?: string;
}
