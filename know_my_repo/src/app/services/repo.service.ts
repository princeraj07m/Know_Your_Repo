import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, timeout } from 'rxjs';
import { apiUrl, API_UPLOAD_TIMEOUT_MS } from '../core/api.config';
import { normalizeErrorMessage } from '../core/error-normalizer';
import type { RepoUploadResponse, GitHubUploadRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class RepoService {
  constructor(private readonly http: HttpClient) {}

  /** Upload via GitHub URL – POST /api/repo/github */
  uploadFromGitHub(url: string): Observable<RepoUploadResponse> {
    const body: GitHubUploadRequest = { url: url.trim() };
    return this.http.post<RepoUploadResponse>(apiUrl('repo/github'), body).pipe(
      timeout(API_UPLOAD_TIMEOUT_MS),
      catchError((err) => throwError(() => new Error(normalizeErrorMessage(err, 'Upload failed. Please try again.'))))
    );
  }

  /** Upload via ZIP file – POST /api/repo/upload */
  uploadZip(file: File): Observable<RepoUploadResponse> {
    const formData = new FormData();
    formData.set('file', file, file.name);
    return this.http.post<RepoUploadResponse>(apiUrl('repo/upload'), formData).pipe(
      timeout(API_UPLOAD_TIMEOUT_MS),
      catchError((err) => throwError(() => new Error(normalizeErrorMessage(err, 'Upload failed. Please try again.'))))
    );
  }
}
