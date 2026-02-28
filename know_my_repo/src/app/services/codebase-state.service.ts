import { Injectable, signal, computed } from '@angular/core';
import type { AnalysisResult, ExplainResult } from '../models';

@Injectable({ providedIn: 'root' })
export class CodebaseStateService {
  private readonly repoIdSignal = signal<string | null>(null);
  private readonly analysisSignal = signal<AnalysisResult | null>(null);
  private readonly explainSignal = signal<ExplainResult | null>(null);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly repoId = this.repoIdSignal.asReadonly();
  readonly analysis = this.analysisSignal.asReadonly();
  readonly explain = this.explainSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly hasData = computed(() =>
    this.repoIdSignal() !== null && (this.analysisSignal() !== null || this.explainSignal() !== null)
  );

  setRepoId(id: string | null): void {
    this.repoIdSignal.set(id);
    if (!id) {
      this.analysisSignal.set(null);
      this.explainSignal.set(null);
    }
    this.errorSignal.set(null);
  }

  setAnalysis(value: AnalysisResult | null): void {
    this.analysisSignal.set(value);
    this.errorSignal.set(null);
  }

  setExplain(value: ExplainResult | null): void {
    this.explainSignal.set(value);
    this.errorSignal.set(null);
  }

  setLoading(loading: boolean): void {
    this.loadingSignal.set(loading);
  }

  setError(message: string | null): void {
    this.errorSignal.set(message);
  }

  setFullState(repoId: string, analysis: AnalysisResult | null, explain: ExplainResult | null): void {
    this.repoIdSignal.set(repoId);
    this.analysisSignal.set(analysis);
    this.explainSignal.set(explain);
    this.loadingSignal.set(false);
    this.errorSignal.set(null);
  }

  clear(): void {
    this.repoIdSignal.set(null);
    this.analysisSignal.set(null);
    this.explainSignal.set(null);
    this.loadingSignal.set(false);
    this.errorSignal.set(null);
  }
}
