import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-alert.component.html',
  styleUrl: './error-alert.component.scss'
})
export class ErrorAlertComponent {
  readonly message = input.required<string>();
  readonly title = input<string>('Something went wrong');
  readonly dismissible = input<boolean>(true);
  readonly retryable = input<boolean>(false);
  readonly retryLabel = input<string>('Try again');

  readonly dismissed = output<void>();
  readonly retry = output<void>();

  onDismiss(): void {
    this.dismissed.emit();
  }

  onRetry(): void {
    this.retry.emit();
  }
}
