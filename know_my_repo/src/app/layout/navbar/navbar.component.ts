import { Component, output, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  readonly themeService = inject(ThemeService);
  readonly menuToggled = output<void>();

  onMenuClick(): void {
    this.menuToggled.emit();
  }

  onThemeToggle(): void {
    this.themeService.toggle();
  }
}
