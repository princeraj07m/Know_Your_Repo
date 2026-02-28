import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, throwError, timeout } from 'rxjs';
import { apiUrl, API_ANALYZE_TIMEOUT_MS } from '../core/api.config';
import { normalizeErrorMessage } from '../core/error-normalizer';
import { mapBackendToFrontend } from './backend-mapper.service';
import type { AnalysisResult, ExplainResult } from '../models';
import type { BackendAnalyzeResponse } from '../models/backend-response.model';

export interface AnalyzeResult {
  analysis: AnalysisResult;
  explain: ExplainResult;
}

@Injectable({ providedIn: 'root' })
export class AnalysisService {
  constructor(private readonly http: HttpClient) {}

  /** Analyze GitHub repo – POST /api/analyze/json with { repoUrl } */
  analyzeFromGitHub(repoUrl: string): Observable<AnalyzeResult> {
    const body = { repoUrl: repoUrl.trim() };
    return this.http
      .post<BackendAnalyzeResponse>(apiUrl('analyze/json'), body, {
        headers: { Accept: 'application/json' },
      })
      .pipe(
        timeout(API_ANALYZE_TIMEOUT_MS),
        map((res) => mapBackendToFrontend(res)),
        catchError((err) => throwError(() => new Error(normalizeErrorMessage(err, 'Analysis failed. Please try again.'))))
      );
  }

  /** Analyze ZIP file – POST /api/analyze-zip/json with FormData (zipfile) */
  analyzeFromZip(file: File): Observable<AnalyzeResult> {
    const formData = new FormData();
    formData.set('zipfile', file, file.name);
    return this.http
      .post<BackendAnalyzeResponse>(apiUrl('analyze-zip/json'), formData, {
        headers: { Accept: 'application/json' },
      })
      .pipe(
        timeout(API_ANALYZE_TIMEOUT_MS),
        map((res) => mapBackendToFrontend(res)),
        catchError((err) => throwError(() => new Error(normalizeErrorMessage(err, 'ZIP analysis failed. Please try again.'))))
      );
  }
}
