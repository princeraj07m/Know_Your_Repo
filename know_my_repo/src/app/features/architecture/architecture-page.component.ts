import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { CodebaseStateService } from '../../services/codebase-state.service';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { AnimatedCardComponent } from '../../shared/animated-card/animated-card.component';
import type { ArchitectureLayer } from '../../models';

@Component({
  selector: 'app-architecture-page',
  standalone: true,
  imports: [CommonModule, EmptyStateComponent, AnimatedCardComponent],
  templateUrl: './architecture-page.component.html',
  styleUrl: './architecture-page.component.scss',
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-12px)' }),
        animate('0.3s ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.35s ease-out', style({ opacity: 1 }))
      ])
    ]),
    trigger('expandAccordion', [
      transition(':enter', [
        style({ height: 0, opacity: 0, overflow: 'hidden' }),
        animate('0.25s ease-out', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('0.2s ease-in', style({ height: 0, opacity: 0, overflow: 'hidden' }))
      ])
    ])
  ]
})
export class ArchitecturePageComponent {
  private readonly state = inject(CodebaseStateService);

  readonly hasData = this.state.hasData;
  readonly analysis = this.state.analysis;

  readonly layers = computed(() => this.analysis()?.layers ?? []);
  readonly coreComponents = computed(() => this.analysis()?.coreComponents ?? []);
  readonly architectureStyle = computed(() => this.analysis()?.architectureStyle ?? null);

  readonly expandedAccordion = signal<string | null>(null);

  toggle(id: string): void {
    this.expandedAccordion.update((current) => (current === id ? null : id));
  }

  isExpanded(id: string): boolean {
    return this.expandedAccordion() === id;
  }

  trackByLayer(_index: number, layer: ArchitectureLayer): string {
    return layer.name;
  }
}
