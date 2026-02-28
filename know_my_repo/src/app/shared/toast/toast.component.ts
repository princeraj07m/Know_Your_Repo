import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { ToastService, type Toast, type ToastType } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  animations: [
    trigger('toastIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(100%)' }),
        animate('0.25s ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('0.2s ease-in', style({ opacity: 0, transform: 'translateX(50%)' }))
      ])
    ])
  ]
})
export class ToastComponent {
  readonly toastService = inject(ToastService);

  icon(type: ToastType): string {
    const map: Record<ToastType, string> = {
      success: 'fa-circle-check',
      error: 'fa-circle-exclamation',
      warning: 'fa-triangle-exclamation',
      info: 'fa-circle-info',
      timeout: 'fa-clock'
    };
    return map[type] ?? 'fa-bell';
  }

  dismiss(toast: Toast): void {
    this.toastService.dismiss(toast.id);
  }
}
