import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { RouteTrace } from '../../models';

@Component({
  selector: 'app-trace-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trace-panel.component.html',
  styleUrl: './trace-panel.component.scss'
})
export class TracePanelComponent {
  readonly trace = input<RouteTrace | null>(null);
  readonly visible = input<boolean>(false);
  readonly closed = output<void>();

  readonly isOpen = signal(false);

  close(): void {
    this.closed.emit();
  }

  onBackdropClick(): void {
    this.close();
  }
}
