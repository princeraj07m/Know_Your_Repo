import {
  Component,
  input,
  output,
  AfterViewInit,
  OnDestroy,
  signal,
  effect,
  inject,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import mermaid from 'mermaid';

@Component({
  selector: 'app-mermaid-diagram',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mermaid-diagram.component.html',
  styleUrl: './mermaid-diagram.component.scss'
})
export class MermaidDiagramComponent implements AfterViewInit, OnDestroy {
  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;

  readonly definition = input<string>('');
  readonly error = output<string>();
  readonly zoomLevel = signal(1);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);

  private container: HTMLDivElement | null = null;
  private readonly ZOOM_STEP = 0.25;
  private readonly MIN_ZOOM = 0.5;
  private readonly MAX_ZOOM = 2;

  constructor() {
    effect(() => {
      const def = this.definition();
      if (this.container && def) {
        this.render(def);
      }
    });
  }

  ngAfterViewInit(): void {
    this.container = this.containerRef?.nativeElement ?? null;
    const def = this.definition();
    if (this.container && def) {
      this.render(def);
    } else if (this.container && !def) {
      this.isLoading.set(false);
    }
  }

  ngOnDestroy(): void {
    this.container = null;
  }

  private async render(definition: string): Promise<void> {
    if (!this.container) return;
    this.isLoading.set(true);
    this.hasError.set(false);
    const pre = document.createElement('pre');
    pre.className = 'mermaid';
    pre.textContent = definition.trim();
    this.container.innerHTML = '';
    this.container.appendChild(pre);

    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        themeVariables: {
          primaryColor: '#3b82f6',
          primaryTextColor: '#f1f5f9',
          primaryBorderColor: '#64748b',
          lineColor: '#94a3b8',
          secondaryColor: '#1e293b',
          tertiaryColor: '#0f172a'
        }
      });
      await mermaid.run({
        nodes: [this.container],
        suppressErrors: false
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to render diagram';
      this.hasError.set(true);
      this.error.emit(msg);
    } finally {
      this.isLoading.set(false);
    }
  }

  zoomIn(): void {
    this.zoomLevel.update((z) => Math.min(this.MAX_ZOOM, z + this.ZOOM_STEP));
  }

  zoomOut(): void {
    this.zoomLevel.update((z) => Math.max(this.MIN_ZOOM, z - this.ZOOM_STEP));
  }

  resetZoom(): void {
    this.zoomLevel.set(1);
  }

  async exportPng(): Promise<void> {
    const el = this.container?.querySelector('svg');
    if (!el) return;
    const svgData = new XMLSerializer().serializeToString(el);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const a = document.createElement('a');
      a.download = 'workflow-diagram.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = url;
  }
}
