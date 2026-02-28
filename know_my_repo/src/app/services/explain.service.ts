import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, timeout } from 'rxjs';
import { apiUrl, API_EXPLAIN_TIMEOUT_MS } from '../core/api.config';
import { normalizeErrorMessage } from '../core/error-normalizer';
import type { ExplainResult } from '../models';

@Injectable({ providedIn: 'root' })
export class ExplainService {
  constructor(private readonly http: HttpClient) {}

  /** Get explanation – POST /api/explain/:repoId */
  explain(repoId: string): Observable<ExplainResult> {
    return this.http.post<ExplainResult>(apiUrl(`explain/${encodeURIComponent(repoId)}`), {}).pipe(
      timeout(API_EXPLAIN_TIMEOUT_MS),
      catchError((err) => throwError(() => new Error(normalizeErrorMessage(err, 'Explanation failed. Please try again.'))))
    );
  }
}
