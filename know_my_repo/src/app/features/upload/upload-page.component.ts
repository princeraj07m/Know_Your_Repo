import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AnalysisService } from '../../services/analysis.service';
import { CodebaseStateService } from '../../services/codebase-state.service';
import { ToastService } from '../../shared/toast/toast.service';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-upload-page',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './upload-page.component.html',
  styleUrl: './upload-page.component.scss',
})
export class UploadPageComponent {
  readonly githubUrl = signal('');
  readonly selectedFile = signal<File | null>(null);
  readonly isDragging = signal(false);
  readonly isAnalyzing = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly stepLabel = computed(() => (this.isAnalyzing() ? 'Analyzing codebase…' : 'Ready'));

  constructor(
    private readonly analysis: AnalysisService,
    private readonly state: CodebaseStateService,
    private readonly toast: ToastService,
    private readonly router: Router
  ) {}

  get canAnalyze(): boolean {
    const url = this.githubUrl().trim();
    const file = this.selectedFile();
    return (url.length > 0 || file !== null) && !this.isAnalyzing();
  }

  onAnalyze(): void {
    if (!this.canAnalyze) return;

    const url = this.githubUrl().trim();
    const file = this.selectedFile();

    this.errorMessage.set(null);
    this.isAnalyzing.set(true);
    this.state.setLoading(true);

    const analyze$ = file
      ? this.analysis.analyzeFromZip(file)
      : this.analysis.analyzeFromGitHub(url);

    analyze$.pipe(
      finalize(() => {
        this.state.setLoading(false);
        this.isAnalyzing.set(false);
      })
    ).subscribe({
      next: (res) => {
        this.state.setRepoId(res.analysis.repoId);
        this.state.setAnalysis(res.analysis);
        this.state.setExplain(res.explain);
        this.toast.success('Codebase analyzed successfully. Redirecting to dashboard.');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMessage.set(err?.message ?? 'Analysis failed. Please try again.');
      },
    });
  }

  onGitHubInput(): void {
    if (this.githubUrl().trim().length > 0) {
      this.selectedFile.set(null);
    }
    this.errorMessage.set(null);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
    const files = event.dataTransfer?.files;
    if (files?.length) {
      const f = files[0];
      if (f.name.toLowerCase().endsWith('.zip')) {
        this.selectedFile.set(f);
        this.githubUrl.set('');
      }
    }
    this.errorMessage.set(null);
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file?.name.toLowerCase().endsWith('.zip')) {
      this.selectedFile.set(file);
      this.githubUrl.set('');
    }
    input.value = '';
  }

  clearFile(): void {
    this.selectedFile.set(null);
  }
}
