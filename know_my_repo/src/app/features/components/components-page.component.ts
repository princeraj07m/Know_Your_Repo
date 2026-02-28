import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { CodebaseStateService } from '../../services/codebase-state.service';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { AnimatedCardComponent } from '../../shared/animated-card/animated-card.component';
import type { RouteTrace } from '../../models';

@Component({
  selector: 'app-components-page',
  standalone: true,
  imports: [CommonModule, EmptyStateComponent, AnimatedCardComponent],
  templateUrl: './components-page.component.html',
  styleUrl: './components-page.component.scss',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('0.35s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class ComponentsPageComponent {
  private readonly state = inject(CodebaseStateService);
  readonly hasData = this.state.hasData;
  readonly coreComponents = computed(() => this.state.analysis()?.coreComponents ?? []);
  readonly routeTraces = computed(() => this.state.analysis()?.routeTraces ?? []);
  readonly expandedRoute = signal<string | null>(null);

  toggleTrace(trace: RouteTrace): void {
    this.expandedRoute.update((current) => (current === trace.route ? null : trace.route));
  }
}
