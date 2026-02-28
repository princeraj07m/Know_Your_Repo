import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { CodebaseStateService } from '../../services/codebase-state.service';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { FileTreeComponent } from '../../shared/file-tree/file-tree.component';

@Component({
  selector: 'app-insights-page',
  standalone: true,
  imports: [CommonModule, EmptyStateComponent, FileTreeComponent],
  templateUrl: './insights-page.component.html',
  styleUrl: './insights-page.component.scss',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('0.35s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
  ]
})
export class InsightsPageComponent {
  private readonly state = inject(CodebaseStateService);
  readonly hasData = this.state.hasData;
  readonly summary = computed(() => this.state.explain()?.summary ?? null);
  readonly sections = computed(() => this.state.explain()?.sections ?? []);
  readonly risks = computed(() => this.state.analysis()?.risks ?? []);
  readonly importantFiles = computed(() => this.state.analysis()?.importantFiles ?? []);
  readonly circularDependencies = computed(() => this.state.analysis()?.circularDependencies ?? []);

  readonly topFiles = computed(() => {
    const files = [...this.importantFiles()].sort((a, b) => b.importance - a.importance);
    return files.slice(0, 10);
  });

  readonly executionSection = computed(() => {
    return this.sections().find((s) => s.title === 'Execution Flow') ?? null;
  });

  readonly readmeSection = computed(() => {
    return this.sections().find((s) => s.title === 'README Summary') ?? null;
  });

  readonly folderSection = computed(() => {
    const all = this.sections();
    return all.find((s) => s.title === 'Folder Structure' || s.title === 'Folder Tree') ?? null;
  });

  readonly otherSections = computed(() => {
    const folder = this.folderSection();
    const exec = this.executionSection();
    const readme = this.readmeSection();
    return this.sections().filter((s) => s !== folder && s !== exec && s !== readme);
  });

  readonly folderTreeLines = computed(() => {
    const content = this.folderSection()?.content ?? '';
    return content
      .split('\n')
      .map((line) => line.replace(/\s+$/u, ''))
      .filter((line) => line.trim().length > 0);
  });

  readonly folderTreeText = computed(() => this.folderTreeLines().join('\n'));

  readonly folderRoots = computed(() => {
    const roots = new Set<string>();
    for (const line of this.folderTreeLines()) {
      const trimmed = line.trim();
      const withoutTreeChars = trimmed.replace(/^[\-\*\|\s└├─]+/, '').trim();
      const firstSegment = withoutTreeChars.split(/[\\/]/u)[0];
      if (firstSegment) {
        roots.add(firstSegment);
        if (roots.size >= 8) break;
      }
    }
    return Array.from(roots);
  });

  readonly executionSteps = computed(() => {
    const content = this.executionSection()?.content ?? '';
    const trimmed = content.trim();
    if (!trimmed) return [] as string[];

    const byLines = trimmed
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    let candidates = byLines;
    if (candidates.length <= 1) {
      candidates = trimmed
        .split(/(?=\d+\.\s)/u)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);
    }

    if (candidates.length === 0) {
      candidates = [trimmed];
    }

    return candidates
      .map((step) => step.replace(/^\d+\.\s*/u, '').trim())
      .filter((step) => step.length > 0)
      .slice(0, 8);
  });

  readonly readmeBullets = computed(() => {
    const content = this.readmeSection()?.content ?? '';
    const trimmed = content.trim();
    if (!trimmed) return [] as string[];

    const lines = trimmed
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    let bullets = lines.filter((l) => /^[-*•]/u.test(l)).map((l) => l.replace(/^[-*•]\s*/u, '').trim());

    if (bullets.length === 0) {
      bullets = trimmed
        .split(/(?<=[.!?])\s+/u)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    }

    return bullets.slice(0, 12);
  });

  /** Summary parsed into labeled key-value cards */
  readonly summaryCards = computed(() => {
    const analysis = this.state.analysis();
    const summary = this.summary();
    const cards: { label: string; value: string }[] = [];

    if (analysis) {
      if (analysis.projectType) cards.push({ label: 'Project Type', value: analysis.projectType });
      if (analysis.frameworks?.length) cards.push({ label: 'Framework', value: analysis.frameworks.join(', ') });
      if (analysis.architectureStyle) cards.push({ label: 'Architecture', value: analysis.architectureStyle });
      if (analysis.entryPoint) cards.push({ label: 'Entry Point', value: analysis.entryPoint });
    }

    if (summary && summary.trim()) {
      cards.push({ label: 'Summary', value: summary.slice(0, 400) + (summary.length > 400 ? '…' : '') });
    }

    return cards;
  });

  /** Execution steps parsed for timeline (with route entries) */
  readonly executionStepsParsed = computed(() => {
    const content = this.executionSection()?.content ?? '';
    const trimmed = content.trim();
    if (!trimmed) return [] as { type: 'step' | 'routes'; index?: number; title: string; routes?: string[] }[];

    const lines = trimmed.split(/\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    const result: { type: 'step' | 'routes'; index?: number; title: string; routes?: string[] }[] = [];
    let stepIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isRoutesHeader = /^routes?:\s*$/i.test(line);

      if (isRoutesHeader) {
        const routeLines: string[] = [];
        for (let j = i + 1; j < lines.length; j++) {
          const rl = lines[j];
          if (/^(GET|POST|PUT|PATCH|DELETE)\s+\S+/i.test(rl) || /\s+(\/\S+|\w+)\s*[->]\s*/.test(rl)) {
            routeLines.push(rl);
          } else if (rl.length > 0 && !/^\d+\./.test(rl)) {
            break;
          }
        }
        result.push({ type: 'routes', title: 'Routes', routes: routeLines.length > 0 ? routeLines : [] });
        i += routeLines.length;
        continue;
      }

      const cleaned = line.replace(/^\d+\.\s*/, '').trim();
      if (cleaned) {
        result.push({ type: 'step', index: ++stepIndex, title: cleaned });
      }
    }

    if (result.length === 0) {
      const steps = trimmed.split(/(?=\d+\.\s)/u).map((s) => s.replace(/^\d+\.\s*/, '').trim()).filter(Boolean);
      return steps.slice(0, 10).map((s, i) => ({ type: 'step' as const, index: i + 1, title: s }));
    }

    return result;
  });
}
