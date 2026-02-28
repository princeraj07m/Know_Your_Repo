/** Response from POST /api/explain/:repoId */
export interface ExplainResult {
  repoId: string;
  summary?: string;
  sections?: ExplainSection[];
}

export interface ExplainSection {
  title: string;
  content: string;
}
