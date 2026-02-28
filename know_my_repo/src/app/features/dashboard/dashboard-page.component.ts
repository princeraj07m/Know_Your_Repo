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
  readonly databaseModels = computed(() => this.buildDatabaseModels(this.analysis()));
  readonly folderSection = computed(() => this.getFolderSection(this.explain()));
  readonly folderTreeLines = computed(() => this.buildFolderTreeLines(this.folderSection()));
  readonly folderRoots = computed(() => this.buildFolderRoots(this.folderTreeLines()));
  readonly folderTreeText = computed(() => this.folderTreeLines().join('\n'));

  private buildOverviewItems(a: AnalysisResult | null): { label: string; value: string }[] {
    if (!a) return [];
    const items: { label: string; value: string }[] = [];
    if (a.projectType) items.push({ label: 'Project type', value: a.projectType });
    if (a.entryPoint) items.push({ label: 'Entry point', value: a.entryPoint });
    if (a.architectureStyle) items.push({ label: 'Architecture', value: a.architectureStyle });
    if (a.frameworks?.length) items.push({ label: 'Frameworks', value: a.frameworks.join(', ') });
    return items;
  }

  private getFirstExplainSection(explain: ExplainResult | null): { title: string; content: string } | null {
    if (!explain?.sections?.length) return null;
    const s = explain.sections[0];
    return { title: s.title, content: s.content };
  }

  private buildDatabaseModels(
    a: AnalysisResult | null
  ): { name: string; fields: string[] }[] {
    if (!a?.database) return [];

    return a.database
      .split(';')
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0)
      .map((entry) => {
        const [namePart, detailsPart] = entry.split(':', 2);
        const name = (namePart ?? 'Model').trim();
        const fields =
          detailsPart
            ?.split(',')
            .map((f) => f.trim())
            .filter((f) => f.length > 0)
            .slice(0, 16) ?? [];
        return { name, fields };
      });
  }

  private getFolderSection(explain: ExplainResult | null): { title: string; content: string } | null {
    const sections = explain?.sections ?? [];
    return (
      sections.find((s) => s.title === 'Folder Structure' || s.title === 'Folder Tree') ??
      sections[0] ??
      null
    );
  }

  private buildFolderTreeLines(section: { content: string } | null): string[] {
    if (!section?.content) return [];
    return section.content
      .split('\n')
      .map((line) => line.replace(/\s+$/u, ''))
      .filter((line) => line.trim().length > 0);
  }

  private buildFolderRoots(lines: string[]): string[] {
    const roots = new Set<string>();
    for (const raw of lines) {
      const trimmed = raw.trim();
      const withoutTreeChars = trimmed.replace(/^[\-\*\|\s└├─]+/, '').trim();
      const firstSegment = withoutTreeChars.split(/[\\/]/)[0];
      if (firstSegment) {
        roots.add(firstSegment);
        if (roots.size >= 12) break;
      }
    }
    return Array.from(roots);
  }
}
