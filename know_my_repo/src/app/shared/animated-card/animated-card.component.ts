import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-animated-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './animated-card.component.html',
  styleUrl: './animated-card.component.scss'
})
export class AnimatedCardComponent {
  readonly padding = input<'none' | 'sm' | 'md' | 'lg'>('md');
  readonly hoverable = input<boolean>(true);
  readonly fillHeight = input<boolean>(false);
}
