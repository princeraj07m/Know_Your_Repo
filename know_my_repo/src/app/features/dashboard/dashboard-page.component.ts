import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { CodebaseStateService } from '../../services/codebase-state.service';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { AnimatedCardComponent } from '../../shared/animated-card/animated-card.component';
import { SkeletonLoaderComponent } from '../../shared/skeleton-loader/skeleton-loader.component';
import type { AnalysisResult, ExplainResult } from '../../models';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterLink, EmptyStateComponent, AnimatedCardComponent, SkeletonLoaderComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(8px)' }),
        animate('0.35s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class DashboardPageComponent {
  private readonly state = inject(CodebaseStateService);

  readonly hasData = this.state.hasData;
  readonly loading = this.state.loading;
  readonly analysis = this.state.analysis;
  readonly explain = this.state.explain;

  readonly overviewItems = computed(() => this.buildOverviewItems(this.analysis()));
  readonly firstSection = computed(() => this.getFirstExplainSection(this.explain()));

  private buildOverviewItems(a: AnalysisResult | null): { label: string; value: string }[] {
    if (!a) return [];
    const items: { label: string; value: string }[] = [];
    if (a.projectType) items.push({ label: 'Project type', value: a.projectType });
    if (a.entryPoint) items.push({ label: 'Entry point', value: a.entryPoint });
    if (a.architectureStyle) items.push({ label: 'Architecture', value: a.architectureStyle });
    if (a.frameworks?.length) items.push({ label: 'Frameworks', value: a.frameworks.join(', ') });
    if (a.database) items.push({ label: 'Database', value: a.database });
    return items;
  }

  private getFirstExplainSection(explain: ExplainResult | null): { title: string; content: string } | null {
    if (!explain?.sections?.length) return null;
    const s = explain.sections[0];
    return { title: s.title, content: s.content };
  }
}
