import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { CodebaseStateService } from '../../services/codebase-state.service';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { AnimatedCardComponent } from '../../shared/animated-card/animated-card.component';
import { MermaidDiagramComponent } from '../../shared/mermaid-diagram/mermaid-diagram.component';

@Component({
  selector: 'app-workflow-page',
  standalone: true,
  imports: [CommonModule, EmptyStateComponent, AnimatedCardComponent, MermaidDiagramComponent],
  templateUrl: './workflow-page.component.html',
  styleUrl: './workflow-page.component.scss',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('0.35s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('diagramEnter', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.98)' }),
        animate('0.4s ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class WorkflowPageComponent {
  private readonly state = inject(CodebaseStateService);
  readonly hasData = this.state.hasData;
  readonly workflows = computed(() => this.state.analysis()?.workflows ?? []);
  readonly executionFlow = computed(() => this.state.analysis()?.executionFlow ?? null);

  private readonly MERMAID_PREFIXES = ['flowchart', 'graph', 'sequenceDiagram', 'classDiagram', 'stateDiagram', 'erDiagram', 'journey', 'gantt', 'pie'];

  /** True if text looks like Mermaid syntax (not plain prose) */
  readonly isMermaidSyntax = (text: string | null): boolean => {
    if (!text?.trim()) return false;
    const t = text.trim();
    return this.MERMAID_PREFIXES.some((p) => t.startsWith(p) || t.startsWith(p + ' '));
  };

  /** Mermaid definition: only use backend if it's valid Mermaid; else generate from workflows */
  readonly mermaidDefinition = computed(() => {
    const fromBackend = this.executionFlow();
    if (fromBackend && fromBackend.trim().length > 0 && this.isMermaidSyntax(fromBackend)) return fromBackend.trim();
    const list = this.workflows();
    if (list.length === 0) {
      return `flowchart LR
  A[Start] --> B[No workflows]
  B --> C[Upload repo to analyze]`;
    }
    const lines = ['flowchart LR'];
    const ids = list.map((_, i) => String.fromCharCode(65 + i));
    lines.push(`  Start --> ${ids[0]}`);
    for (let i = 0; i < ids.length; i++) {
      const label = list[i].name.replace(/"/g, "'").slice(0, 50);
      lines.push(`  ${ids[i]}["${label}"]`);
      if (i < ids.length - 1) lines.push(`  ${ids[i]} --> ${ids[i + 1]}`);
    }
    lines.push(`  ${ids[ids.length - 1]} --> End`);
    return lines.join('\n');
  });

  /** Plain text execution flow when backend returns prose (e.g. frontend projects) */
  readonly executionFlowPlainText = computed(() => {
    const fromBackend = this.executionFlow();
    if (fromBackend && fromBackend.trim().length > 0 && !this.isMermaidSyntax(fromBackend)) return fromBackend.trim();
    return null;
  });
}
