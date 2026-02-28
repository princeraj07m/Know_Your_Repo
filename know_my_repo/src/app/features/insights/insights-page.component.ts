import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { CodebaseStateService } from '../../services/codebase-state.service';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { AnimatedCardComponent } from '../../shared/animated-card/animated-card.component';

@Component({
  selector: 'app-insights-page',
  standalone: true,
  imports: [CommonModule, EmptyStateComponent, AnimatedCardComponent],
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
}
