import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ToastComponent } from '../../shared/toast/toast.component';
import { ThemeService } from '../../core/theme.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent, ToastComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  private readonly theme = inject(ThemeService);
  readonly sidebarVisible = signal(false);
  readonly sidebarCollapsed = signal(false);

  constructor() {
    this.theme.init();
  }

  onMenuToggled(): void {
    this.sidebarVisible.update(v => !v);
  }

  onSidebarLinkClicked(): void {
    if (typeof window !== 'undefined' && window.innerWidth < 992) {
      this.sidebarVisible.set(false);
    }
  }

  onSidebarCollapsedChange(collapsed: boolean): void {
    this.sidebarCollapsed.set(collapsed);
  }
}
