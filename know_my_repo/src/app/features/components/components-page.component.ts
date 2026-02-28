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

  /** Component distribution for chart: Routes, Controllers, Services, Models */
  readonly componentDistribution = computed(() => {
    const a = this.state.analysis();
    if (!a) return [];

    const layers = a.layers ?? [];
    const routesCount = a.routeTraces?.length ?? a.workflows?.length ?? 0;
    const controllersCount = layers.find((l) => l.name === 'Controllers')?.components?.length ?? 0;
    const servicesCount = layers.find((l) => l.name === 'Services')?.components?.length ?? 0;
    const modelsCount = layers.find((l) => l.name === 'Models')?.components?.length ?? 0;

    const items: { label: string; count: number }[] = [];
    if (routesCount > 0) items.push({ label: 'Routes', count: routesCount });
    if (controllersCount > 0) items.push({ label: 'Controllers', count: controllersCount });
    if (servicesCount > 0) items.push({ label: 'Services', count: servicesCount });
    if (modelsCount > 0) items.push({ label: 'Models', count: modelsCount });

    return items;
  });

  readonly maxChartValue = computed(() => {
    const dist = this.componentDistribution();
    if (dist.length === 0) return 1;
    return Math.max(...dist.map((d) => d.count), 1);
  });

  toggleTrace(trace: RouteTrace): void {
    this.expandedRoute.update((current) => (current === trace.route ? null : trace.route));
  }
}
