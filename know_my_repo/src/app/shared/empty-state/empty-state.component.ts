import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss'
})
export class EmptyStateComponent {
  readonly icon = input<string>('fa-folder-open');
  readonly title = input<string>('No data yet');
  readonly message = input<string>('Get started by uploading a codebase or connecting a repository.');
  readonly actionLabel = input<string | null>(null);
  readonly actionRoute = input<string | null>(null);

  readonly action = output<void>();

  onAction(): void {
    this.action.emit();
  }
}
