/** Response from POST /api/repo/github or POST /api/repo/upload */
export interface RepoUploadResponse {
  repoId: string;
  name?: string;
  message?: string;
}

export interface GitHubUploadRequest {
  url: string;
}
